'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  setDoc,
  doc, 
  Timestamp,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from './use-auth';
import { handleFirestoreError, OperationType } from '@/lib/firebase-utils';
import { addMinutes, startOfDay, endOfDay, isWithinInterval, setHours, setMinutes, format } from 'date-fns';

export type AppointmentStatus = 'New' | 'Confirmed' | 'Upcoming' | 'Checked In' | 'Completed' | 'No Show';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string;
}

export function useAppointments() {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<{uid: string, displayName: string, specialization: string, email: string}[]>([]);
  const [patients, setPatients] = useState<{uid: string, displayName: string, email: string}[]>([]);

  useEffect(() => {
    if (!user || !profile || profile.role !== 'front_desk') return;

    const doctorsQuery = query(collection(db, 'users'), where('role', '==', 'doctor'));
    const unsubscribeDoctors = onSnapshot(doctorsQuery, (snapshot) => {
      setDoctors(snapshot.docs.map(doc => ({ 
        uid: doc.id, 
        displayName: doc.data().displayName,
        specialization: doc.data().specialization || 'General',
        email: doc.data().email || ''
      })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    const patientsQuery = query(collection(db, 'users'), where('role', '==', 'patient'));
    const unsubscribePatients = onSnapshot(patientsQuery, (snapshot) => {
      setPatients(snapshot.docs.map(doc => ({ 
        uid: doc.id, 
        displayName: doc.data().displayName,
        email: doc.data().email || ''
      })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    return () => {
      unsubscribeDoctors();
      unsubscribePatients();
    };
  }, [user, profile]);

  useEffect(() => {
    if (!user || !profile) return;

    let q;
    if (profile.role === 'patient') {
      q = query(
        collection(db, 'appointments'), 
        where('patientId', '==', user.uid),
        orderBy('startTime', 'desc')
      );
    } else if (profile.role === 'doctor') {
      q = query(
        collection(db, 'appointments'), 
        where('doctorId', '==', user.uid),
        orderBy('startTime', 'asc')
      );
    } else {
      q = query(
        collection(db, 'appointments'),
        orderBy('startTime', 'asc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startTime: data.startTime.toDate(),
          endTime: data.endTime.toDate(),
        } as Appointment;
      });
      setAppointments(apps);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'appointments');
    });

    return () => unsubscribe();
  }, [user, profile]);

  const bookAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    try {
      // Check for conflicts
      const q = query(
        collection(db, 'appointments'),
        where('doctorId', '==', appointment.doctorId),
        where('startTime', '>=', Timestamp.fromDate(startOfDay(appointment.startTime))),
        where('startTime', '<=', Timestamp.fromDate(endOfDay(appointment.startTime)))
      );
      const snapshot = await getDocs(q);
      const existing = snapshot.docs.map(doc => ({
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime.toDate()
      }));

      const hasConflict = existing.some(ex => 
        isWithinInterval(appointment.startTime, { start: ex.startTime, end: ex.endTime }) ||
        isWithinInterval(appointment.endTime, { start: ex.startTime, end: ex.endTime })
      );

      if (hasConflict) {
        throw new Error('This slot is already booked.');
      }

      await addDoc(collection(db, 'appointments'), {
        ...appointment,
        startTime: Timestamp.fromDate(appointment.startTime),
        endTime: Timestamp.fromDate(appointment.endTime),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'appointments');
    }
  };

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const updateDoctorProfile = async (uid: string, data: Partial<{displayName: string, specialization: string, role: string}>) => {
    try {
      await updateDoc(doc(db, 'users', uid), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const addDoctor = async (data: { displayName: string, specialization: string, email: string }) => {
    try {
      const newDocRef = doc(collection(db, 'users'));
      await setDoc(newDocRef, {
        ...data,
        uid: newDocRef.id,
        role: 'doctor',
        createdAt: Timestamp.now()
      });
      return { id: newDocRef.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'users');
      return null;
    }
  };

  const deleteDoctor = async (uid: string) => {
    try {
      const { deleteDoc: firestoreDeleteDoc } = await import('firebase/firestore');
      await firestoreDeleteDoc(doc(db, 'users', uid));
      setDoctors(prev => prev.filter(d => d.uid !== uid));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
    }
  };

  const addPatient = async (data: { displayName: string, email: string }) => {
    try {
      const newDocRef = doc(collection(db, 'users'));
      await setDoc(newDocRef, {
        ...data,
        uid: newDocRef.id,
        role: 'patient',
        createdAt: Timestamp.now()
      });
      return { id: newDocRef.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'users');
      return null;
    }
  };

  const updatePatientProfile = async (uid: string, data: Partial<{displayName: string, email: string}>) => {
    try {
      await updateDoc(doc(db, 'users', uid), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const deletePatient = async (uid: string) => {
    try {
      const { deleteDoc: firestoreDeleteDoc } = await import('firebase/firestore');
      await firestoreDeleteDoc(doc(db, 'users', uid));
      setPatients(prev => prev.filter(p => p.uid !== uid));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
    }
  };

  const updateAppointment = async (id: string, appointment: Partial<Appointment>) => {
    try {
      const updateData: any = { ...appointment };
      if (appointment.startTime) updateData.startTime = Timestamp.fromDate(appointment.startTime);
      if (appointment.endTime) updateData.endTime = Timestamp.fromDate(appointment.endTime);
      
      await updateDoc(doc(db, 'appointments', id), updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { deleteDoc: firestoreDeleteDoc } = await import('firebase/firestore');
      await firestoreDeleteDoc(doc(db, 'appointments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `appointments/${id}`);
    }
  };

  return { 
    appointments, 
    loading, 
    doctors, 
    patients,
    bookAppointment, 
    updateStatus, 
    updateAppointment,
    deleteAppointment,
    updateDoctorProfile, 
    addDoctor, 
    deleteDoctor,
    addPatient,
    updatePatientProfile,
    deletePatient
  };
}

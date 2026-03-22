/// <reference types="next" />
/// <reference types="next/navigation-types/navigation" />

// see https://nextjs.org/docs/app/api-reference/config/typescript#video-component
declare module '*.mp4' {
  const src: string;
  export default src;
}

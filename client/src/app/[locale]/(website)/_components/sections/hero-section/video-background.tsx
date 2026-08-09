export type VideoBackgroundProps = object;

export default function VideoBackground({}: VideoBackgroundProps) {
  return (
    <div className="absolute inset-0 -top-16.25 -z-10 h-dvh w-full bg-black">
      {/* // <div className="absolute top-[65px] inset-0 -top-16.25 -z-10 h-full w-full"> */}
      {/* <div className="absolute h-full w-full bg-white" /> */}
      <video
        src="/videos/hero-section/hero-section-improved.mp4"
        className="absolute h-full w-full object-cover"
        playsInline
        loop
        muted
        autoPlay
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-75 bg-linear-to-t from-black/70 via-black/35 to-transparent" />
    </div>
  );
}

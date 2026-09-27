export default function Header() {
  return (
    <header className="site-header">
      <div className="topbar">
        <div className="shell topbar__inner">
          <div className="brand">
            <img
              className="brand__logo"
              src="/anmat-logo.png"
              alt="ANMAT, Innovation & Excellence"
              width="300"
              height="110"
            />
          </div>
        </div>
      </div>

      <div className="shell intro">
        <h1>Choose Your Preferred Website Design</h1>
        <p className="intro__lead">
          Review each proposed design and share your feedback to help us
          select and refine the final website experience.
        </p>
        <div className="gold-line" aria-hidden="true" />
      </div>
    </header>
  );
}

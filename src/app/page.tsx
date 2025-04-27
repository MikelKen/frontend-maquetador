"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const buttonCard = document.getElementById("buttonCard");
    const formCard = document.getElementById("formCard");
    const textCard = document.getElementById("textCard");

    if (!buttonCard || !formCard || !textCard) return;

    // Animaciones de flotación
    gsap.to(buttonCard, { y: "-=10", duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(formCard, { y: "-=15", duration: 2.5, repeat: -1, yoyo: true, delay: 0.5, ease: "sine.inOut" });
    gsap.to(textCard, { y: "-=8", duration: 1.8, repeat: -1, yoyo: true, delay: 0.3, ease: "sine.inOut" });

    const cards = document.querySelectorAll(".floating-card");

    cards.forEach((card) => {
      let isDragging = false;
      let offsetX = 0;
      let offsetY = 0;

      const startDrag = (e: MouseEvent | TouchEvent) => {
        isDragging = true;
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
        offsetX = clientX - (card as HTMLElement).getBoundingClientRect().left;
        offsetY = clientY - (card as HTMLElement).getBoundingClientRect().top;
        (card as HTMLElement).style.cursor = "grabbing";
        (card as HTMLElement).style.zIndex = "10";
        e.preventDefault();
      };

      const drag = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
        const x = clientX - offsetX;
        const y = clientY - offsetY;
        (card as HTMLElement).style.left = `${x}px`;
        (card as HTMLElement).style.top = `${y}px`;
        (card as HTMLElement).style.transform = "none";
        e.preventDefault();
      };

      const endDrag = () => {
        if (isDragging) {
          isDragging = false;
          (card as HTMLElement).style.cursor = "grab";
          setTimeout(() => {
            (card as HTMLElement).style.zIndex = "5";
          }, 200);
        }
      };

      card.addEventListener("mousedown", startDrag as EventListener);
      document.addEventListener("mousemove", drag as EventListener);
      document.addEventListener("mouseup", endDrag);

      card.addEventListener("touchstart", startDrag as EventListener);
      document.addEventListener("touchmove", drag as EventListener);
      document.addEventListener("touchend", endDrag);
    });

    const adjustLayout = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        gsap.set(buttonCard, { clearProps: "transform" });
        gsap.set(formCard, { clearProps: "transform" });
        gsap.set(textCard, { clearProps: "transform" });
      } else {
        gsap.set(buttonCard, { transform: "rotateX(5deg) rotateY(-10deg)" });
        gsap.set(formCard, { transform: "rotateX(-5deg) rotateY(10deg)" });
        gsap.set(textCard, { transform: "rotateX(8deg) rotateY(5deg)" });
      }
    };

    adjustLayout();
    window.addEventListener("resize", adjustLayout);

    return () => {
      window.removeEventListener("resize", adjustLayout);
    };
  }, []);
  const handleSignIn = () => {
    console.log("Signing in...");
    router.push("/auth/sign-in");
  };

  const handleSignUp = () => {
    console.log("Signing up..");
    router.push("/auth/sign-up");
  };

  return (
    <div className="home-page">
      <div className="body">
        <div className="glow-effect glow-primary" />
        <div className="glow-effect glow-secondary" />
        <div className="grid" />

        <div className="container">
          <nav>
            <div className="logo">
              <div className="logo-icon"></div>
              <span>ASOCIAL¨</span>
            </div>

            <div className="nav-buttons">
              <button className="btn-outline" onClick={handleSignIn}>
                Sign In
              </button>
              <button className="btn-primary" onClick={handleSignUp}>
                Sign Up
              </button>
            </div>
          </nav>

          <main>
            <div className="hero">
              <h1>
                Drag & Drop <span className="highlight">Interface</span> Designer
              </h1>
              <p className="subtitle">
                Building stunning web applications in minutes with automatic code generation and collaboration with your
                team. No programming skills required.
              </p>

              <div className="cta-buttons">
                <button className="btn-primary" onClick={handleSignIn}>
                  Start Now
                </button>
              </div>
            </div>

            <div className="ui-preview">
              <div className="floating-card card-button" id="buttonCard">
                <h3 className="card-title">Button Component</h3>
                <div className="card-content">
                  <div className="mock-button" />
                </div>
                <div className="drag-handle" />
              </div>

              <div className="floating-card card-form" id="formCard">
                <h3 className="card-title">Form Component</h3>
                <div className="card-content">
                  <div className="mock-input" />
                  <div className="mock-input" />
                  <div className="mock-button" />
                </div>
                <div className="drag-handle" />
              </div>

              <div className="floating-card card-text" id="textCard">
                <h3 className="card-title">Text Component</h3>
                <div className="card-content">
                  <div className="mock-text" />
                  <div className="mock-text short" />
                </div>
                <div className="drag-handle" />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

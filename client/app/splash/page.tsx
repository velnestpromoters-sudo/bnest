"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function SplashPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // 3.2s gives time for the 3s animation to finish before snapping to the next screen
    const timer = setTimeout(() => {
      if (isAuthenticated && user?.role === 'owner') {
        router.push('/owner/dashboard');
      } else if (isAuthenticated && user?.role === 'tenant') {
        router.push('/home');
      } else {
        router.push('/home');
      }
    }, 3200);

    return () => clearTimeout(timer);
  }, [router, isAuthenticated, user]);

  return (
    <>
      <style>{`
        .splash-screen {
            width: 100%;
            height: 100vh;
            position: relative;
            background: #FFF;
            animation: bg-transition 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            overflow: hidden;
        }

        .splash-logo-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 140px;
            height: 140px;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .splash-logo-svg {
            width: 100px;
            height: 100px;
            opacity: 0.2;
            color: #FF6A3D;
            animation: logo-anim 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .splash-dot {
            position: absolute;
            top: -50px;
            left: 50%;
            transform: translateX(-50%);
            width: 24px;
            height: 24px;
            background: #FF6A3D;
            border-radius: 50%;
            z-index: 20;
            animation: dot-anim 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .splash-pulse-circle {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            width: 140px;
            height: 140px;
            background: #FF6A3D;
            border-radius: 50%;
            z-index: 5;
            filter: blur(10px);
            opacity: 0;
            animation: pulse-anim 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes bg-transition {
            0%, 60% { background: #FFF; }
            77%, 100% { background: #FF6A3D; }
        }

        @keyframes dot-anim {
            0%, 10% { top: -50px; opacity: 1; transform: translateX(-50%) scale(1); }
            27% { top: calc(50% - 90px); opacity: 1; transform: translateX(-50%) scale(1); }
            35% { top: 50%; opacity: 0; transform: translateX(-50%) scale(0.2); }
            100% { top: 50%; opacity: 0; transform: translateX(-50%) scale(0); }
        }

        @keyframes logo-anim {
            0%, 27% { opacity: 0.2; color: #FF6A3D; transform: scale(1); }
            33% { opacity: 1; color: #FF6A3D; transform: scale(1.08); }
            40% { opacity: 1; color: #FF6A3D; transform: scale(1); }
            60% { opacity: 1; color: #FF6A3D; transform: scale(1); }
            77% { opacity: 1; color: #FFF; transform: scale(1); }
            95%, 100% { opacity: 1; color: #FFF; transform: scale(15) translateY(-28%); }
        }

        @keyframes pulse-anim {
            0%, 40% { transform: translate(-50%, -50%) scale(0); opacity: 0; filter: blur(10px); background: #FF6A3D; }
            41% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; filter: blur(15px); background: #FF6A3D; }
            60% { transform: translate(-50%, -50%) scale(2.5); opacity: 0.5; filter: blur(25px); background: #FF6A3D; }
            77%, 100% { transform: translate(-50%, -50%) scale(25); opacity: 1; filter: blur(0px); background: #FF6A3D; }
        }
      `}</style>
      
      <div className="splash-screen w-full relative">
        <div className="splash-dot"></div>
        <div className="splash-pulse-circle"></div>
        <div className="splash-logo-container">
            <img src="/logo.png" alt="Homyvo Logo" className="splash-logo-svg" style={{ objectFit: 'contain' }} />
        </div>
      </div>
    </>
  );
}

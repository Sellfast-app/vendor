"use client";

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Circle, Wallet, MapPin, ImageIcon, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';

// Confetti component
const Confetti = () => {
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            animationDelay: `${piece.delay}s`,
          }}
        >
          <div
            className="w-2 h-2 rounded-sm"
            style={{ backgroundColor: piece.color }}
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotateZ(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// OnboardingProgress component for sidebar
export const OnboardingProgress = () => {
  const [tasks, setTasks] = useState({
    bankAccount: false,
    pickupAddress: false,
    logoAndBanner: false,
    products: false,
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('onboarding_progress');
    if (saved) {
      const parsedTasks = JSON.parse(saved);
      setTasks(parsedTasks);
      calculateProgress(parsedTasks);
    }
  }, []);

  const calculateProgress = (taskData: typeof tasks) => {
    const completed = Object.values(taskData).filter(Boolean).length;
    setProgress((completed / 4) * 100);
  };

  if (progress === 100) return null;

  return (
    <div className="px-6 py-4 mb-4 border-b border-[#F5F5F5] dark:border-[#1F1F1F]">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">Setup Progress</p>
          <p className="text-xs font-semibold text-primary">{Math.round(progress)}%</p>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
};

// Main OnboardingModal component
export const OnboardingModal = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [tasks, setTasks] = useState({
    bankAccount: false,
    pickupAddress: false,
    logoAndBanner: false,
    products: false,
  });

  useEffect(() => {
    // Check if user is new (first time after signup)
    const hasSeenOnboarding = localStorage.getItem('has_seen_onboarding');
    const saved = localStorage.getItem('onboarding_progress');
    
    if (saved) {
      const parsedTasks = JSON.parse(saved);
      setTasks(parsedTasks);
      
      // Check if critical tasks are incomplete
      const criticalTasksIncomplete = !parsedTasks.bankAccount || !parsedTasks.pickupAddress;
      
      if (criticalTasksIncomplete) {
        setIsOpen(true);
      } else if (!hasSeenOnboarding) {
        setIsOpen(true);
      }
    } else {
      // New user - show modal
      setIsOpen(true);
      localStorage.setItem('onboarding_progress', JSON.stringify(tasks));
    }
  }, []);

  useEffect(() => {
    // Check if all tasks are complete
    const allComplete = Object.values(tasks).every(Boolean);
    if (allComplete && isOpen) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [tasks, isOpen]);

  const handleTaskClick = (taskKey: keyof typeof tasks, route: string) => {
    // Mark task as viewed
    localStorage.setItem('has_seen_onboarding', 'true');
    setIsOpen(false);
    router.push(route);
  };

  const handleClose = () => {
    const criticalTasksComplete = tasks.bankAccount && tasks.pickupAddress;
    if (criticalTasksComplete) {
      localStorage.setItem('has_seen_onboarding', 'true');
      setIsOpen(false);
    }
  };

  const taskConfig = [
    {
      key: 'bankAccount' as const,
      icon: Wallet,
      title: 'Setup your bank information',
      description: 'Start receiving payout by connecting your bank details',
      route: '/payouts',
      iconColor: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-950',
      important: true,
    },
    {
      key: 'pickupAddress' as const,
      icon: MapPin,
      title: 'Add your pickup address',
      description: 'Let customers know where to collect their orders',
      route: '/settings',
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
      important: true,
    },
    {
      key: 'logoAndBanner' as const,
      icon: ImageIcon,
      title: 'Customize your storefront',
      description: 'Make a lasting impression by adding your unique touch',
      route: '/settings',
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
      important: false,
    },
    {
      key: 'products' as const,
      icon: Package,
      title: 'Add your 1st product',
      description: 'Take the bold step now by listing your first product.',
      route: '/products',
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-950',
      important: false,
    },
  ];

  const completedTasks = Object.values(tasks).filter(Boolean).length;
  const criticalTasksComplete = tasks.bankAccount && tasks.pickupAddress;

  return (
    <>
      {showConfetti && <Confetti />}
      
      <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="backdrop-blur-xs bg-[#06140033] dark:bg-black/50" />
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-sm font-semibold">Complete Store Setup</DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Unlock your full potential by completing your profile
                </p>
              </div>
              {criticalTasksComplete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            {taskConfig.map((task, index) => {
              const Icon = task.icon;
              const isCompleted = tasks[task.key];
              const isFirst = index === 0;

              return (
                <div key={task.key} className="relative">
                  {/* Vertical line connector */}
                  {!isFirst && (
                    <div className="absolute left-[22px] -top-4 w-0.5 h-4 bg-gray-200 dark:bg-gray-700" />
                  )}
                  
                  <button
                    onClick={() => handleTaskClick(task.key, task.route)}
                    className="w-full flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary hover:bg-accent/50 transition-all duration-200 text-left group"
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${task.bgColor} flex items-center justify-center relative`}>
                      <Icon className={`w-6 h-6 ${task.iconColor}`} />
                      {isCompleted && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {task.title}
                        </h3>
                        {task.important && !isCompleted && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {completedTasks === 4 && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-green-700 dark:text-green-400">
                🎉 Congratulations! Your store is fully set up!
              </h3>
              <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                You&apos;re ready to start selling and managing your business.
              </p>
            </div>
          )}

          {!criticalTasksComplete && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
                ⚠️ Please complete required tasks to access all features
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper function to mark tasks as complete (call this from your settings pages)
export const markTaskComplete = (taskKey: 'bankAccount' | 'pickupAddress' | 'logoAndBanner' | 'products') => {
  const saved = localStorage.getItem('onboarding_progress');
  if (saved) {
    const tasks = JSON.parse(saved);
    tasks[taskKey] = true;
    localStorage.setItem('onboarding_progress', JSON.stringify(tasks));
  }
};
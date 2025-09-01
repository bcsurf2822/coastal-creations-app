"use client";

import React from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';

const AnimatedCreature = ({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  const randomDuration = Math.random() * 2 + 3;
  const randomRotate = Math.random() * 10 - 5;

  return (
    <motion.div
      className={`w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 ${className}`}
      animate={{
        y: ["0%", "-10%", "0%"],
        rotate: [0, randomRotate, -randomRotate, 0],
      }}
      transition={{
        duration: randomDuration,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    >
      {children}
    </motion.div>
  );
};

const SeaCreatures = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Far top left - Starfish */}
      <div className="absolute top-4 left-12 opacity-50">
        <AnimatedCreature>
          <Image
            src="/assets/svg/animate/starfish.svg"
            alt="Starfish"
            width={120}
            height={120}
            className="w-full h-full"
          />
        </AnimatedCreature>
      </div>

      {/* Far top right - Fish behind text */}
      <div className="absolute top-6 right-8 opacity-30 z-0">
        <AnimatedCreature>
          <Image
            src="/assets/svg/animate/fish1.svg"
            alt="Fish"
            width={140}
            height={140}
            className="w-full h-full"
          />
        </AnimatedCreature>
      </div>

      {/* Top center left - Octopus */}
      <div className="absolute top-16 left-1/4 opacity-45">
        <AnimatedCreature>
          <Image
            src="/assets/svg/animate/octopus.svg"
            alt="Octopus"
            width={100}
            height={100}
            className="w-full h-full"
          />
        </AnimatedCreature>
      </div>

      {/* Top center right - Stingray behind text */}
      <div className="absolute top-20 right-1/3 opacity-25 z-0">
        <AnimatedCreature>
          <Image
            src="/assets/svg/animate/stingray.svg"
            alt="Stingray"
            width={130}
            height={130}
            className="w-full h-full"
          />
        </AnimatedCreature>
      </div>

      {/* Middle far left - Shark */}
      <div className="absolute top-1/3 left-4 opacity-50">
        <AnimatedCreature>
          <Image
            src="/assets/svg/animate/shark.svg"
            alt="Shark"
            width={110}
            height={110}
            className="w-full h-full"
          />
        </AnimatedCreature>
      </div>

      {/* Middle far right - Jellyfish */}
      <div className="absolute top-2/5 right-4 opacity-60">
        <AnimatedCreature>
          <Image
            src="/assets/svg/jellyfish.svg"
            alt="Jellyfish"
            width={90}
            height={90}
            className="w-full h-full"
          />
        </AnimatedCreature>
      </div>

      {/* Lower middle left - Shell */}
      <div className="absolute top-3/5 left-1/5 opacity-40">
        <AnimatedCreature>
          <Image
            src="/assets/svg/shell-paint.svg"
            alt="Shell"
            width={80}
            height={80}
            className="w-full h-full"
          />
        </AnimatedCreature>
      </div>

      {/* Lower middle right - Turtle */}
      <div className="absolute top-2/3 right-1/4 opacity-55">
        <AnimatedCreature>
          <Image
            src="/assets/svg/turtle.svg"
            alt="Turtle"
            width={95}
            height={95}
            className="w-full h-full"
          />
        </AnimatedCreature>
      </div>

      {/* Bottom left - Fish */}
      <div className="absolute bottom-12 left-8 opacity-50">
        <AnimatedCreature>
          <Image
            src="/assets/svg/animate/fish1.svg"
            alt="Fish"
            width={120}
            height={120}
            className="w-full h-full"
          />
        </AnimatedCreature>
      </div>

      {/* Bottom center - Octopus */}
      <div className="absolute bottom-8 left-1/3 opacity-45">
        <AnimatedCreature>
          <Image
            src="/assets/svg/animate/octopus.svg"
            alt="Octopus"
            width={110}
            height={110}
            className="w-full h-full"
          />
        </AnimatedCreature>
      </div>

      {/* Bottom right - Stingray */}
      <div className="absolute bottom-16 right-12 opacity-60">
        <AnimatedCreature>
          <Image
            src="/assets/svg/animate/stingray.svg"
            alt="Stingray"
            width={100}
            height={100}
            className="w-full h-full"
          />
        </AnimatedCreature>
      </div>

      {/* Top middle scattered - Turtle */}
      <div className="absolute top-1/4 left-2/3 opacity-35">
        <AnimatedCreature>
          <Image
            src="/assets/svg/turtle.svg"
            alt="Turtle"
            width={70}
            height={70}
            className="w-full h-full"
          />
        </AnimatedCreature>
      </div>

      {/* Lower scattered - Jellyfish */}
      <div className="absolute top-3/4 left-1/2 opacity-40">
        <AnimatedCreature>
          <Image
            src="/assets/svg/jellyfish.svg"
            alt="Jellyfish"
            width={85}
            height={85}
            className="w-full h-full"
          />
        </AnimatedCreature>
      </div>

      {/* Additional corner - Shell */}
      <div className="absolute top-1/2 left-3/4 opacity-35">
        <AnimatedCreature>
          <Image
            src="/assets/svg/shell-paint.svg"
            alt="Shell"
            width={75}
            height={75}
            className="w-full h-full"
          />
        </AnimatedCreature>
      </div>
    </div>
  );
};

export default SeaCreatures;
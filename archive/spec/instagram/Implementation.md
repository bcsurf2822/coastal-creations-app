
A good approach for this in Next.js is to use the next/script component to lazy-load the Instagram embed script and an Intersection Observer to only render the post content when it scrolls into the user's viewport.

Here is the Next.js component structure:

1. useOnScreen Hook (for Intersection Observer)
First, create a custom hook to detect when the component is visible.

hooks/useOnScreen.js

import { useState, useEffect, useRef } from 'react';

export default function useOnScreen(rootMargin = '0px') {
  const ref = useRef(null);
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update our state when observer callback fires
        if (entry.isIntersecting) {
          setIntersecting(true);
          // Optional: Stop observing once it's visible to save resources
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      // Cleanup the observer when the component unmounts
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [rootMargin]); // Re-run effect if rootMargin changes

  return [ref, isIntersecting];
}

----


2. InstagramPostPreview Component
This component will use the custom hook to lazy load the Instagram post.

components/InstagramPostPreview.js

JavaScript

'use client'; // Important for using hooks and client-side code

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import useOnScreen from '../hooks/useOnScreen'; // Adjust path as needed

/**
 * Renders an Instagram Post using its embed code, with lazy loading.
 * The embed code must include the <blockquote> element and the <script> is loaded by next/script.
 *
 * @param {object} props
 * @param {string} props.embedCode - The <blockquote>...</blockquote> part of the Instagram embed.
 */
export default function InstagramPostPreview({ embedCode }) {
  // 1. Setup Intersection Observer
  const [ref, isVisible] = useOnScreen('100px'); // Load when 100px near the viewport

  // 2. State to track if the post has been processed and rendered by Instagram's script
  const [isLoaded, setIsLoaded] = useState(false);

  // 3. A ref to the container to manage the initial placeholder content
  const containerRef = useRef(null);

  // 4. Effect to tell Instagram's script to render the post once it's loaded and visible
  useEffect(() => {
    if (isVisible && window.instgrm) {
      // This is the function Instagram's embed script uses to find new embeds and process them
      window.instgrm.Embeds.process();
      // Since 'instgrm.Embeds.process()' doesn't give a direct callback, 
      // we check for the expected iframe to confirm loading.
      const observer = new MutationObserver((mutationsList, observer) => {
        if (containerRef.current && containerRef.current.querySelector('iframe')) {
          setIsLoaded(true);
          observer.disconnect();
        }
      });

      // Start observing for changes in the container's children (where the iframe is injected)
      observer.observe(containerRef.current, { childList: true, subtree: true });
      
      return () => observer.disconnect();
    }
  }, [isVisible]);

  const placeholderStyle = {
    // Basic styling for the placeholder to reserve space and prevent layout shift
    width: '100%',
    paddingTop: '125%', // Typical Instagram post aspect ratio (for a square post)
    backgroundColor: '#f0f0f0',
    display: isLoaded ? 'none' : 'block',
    borderRadius: '3px',
  };

  const contentStyle = {
    // Hide content until loaded
    display: isLoaded ? 'block' : 'none',
  }

  return (
    <div ref={ref} style={{ position: 'relative', maxWidth: '550px', margin: 'auto' }}>
      {/* 1. Only load the Instagram script if the component is visible */}
      {isVisible && (
        <Script 
          src="https://www.instagram.com/embed.js" 
          strategy="lazyOnload" // Use lazyOnload for better performance, but isVisible is the main trigger
        />
      )}
      
      {/* 2. Placeholder while the embed is loading */}
      <div style={placeholderStyle}>
        <p style={{ textAlign: 'center', position: 'absolute', top: '50%', width: '100%', transform: 'translateY(-50%)', color: '#999' }}>Loading Instagram Post...</p>
      </div>

      {/* 3. Container for the embed code */}
      <div 
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: embedCode }}
        style={contentStyle}
      />
    </div>
  );
}

----


3. Usage Example
To use this component on a page or another component:

app/page.js or pages/index.js

JavaScript

import InstagramPostPreview from '../components/InstagramPostPreview';

// Get the embed code from Instagram (right-click post -> Embed -> Copy Embed Code)
const instagramEmbedCode = `
<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/p/C6R_d93Jz-P/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
<div style="padding:16px;">
... (The rest of the embed blockquote content)
</div>
</blockquote>
`;

export default function Home() {
  return (
    <div>
      <h1>My Page Content</h1>
      {/* Lots of content to make the post initially off-screen */}
      
      <InstagramPostPreview embedCode={instagramEmbedCode} />
      
      {/* More content */}
    </div>
  );
}
Explanation
useOnScreen (Intersection Observer): This hook detects when the wrapper div (ref) enters the viewport. This is the condition for initiating the load.

next/script: The core Instagram script (embed.js) is only included in the DOM when isVisible is true. This prevents the script's heavy load until necessary, significantly boosting initial page performance.

dangerouslySetInnerHTML: The Instagram embed code (the <blockquote class="instagram-media">...</blockquote>) is rendered into the DOM.

useEffect and window.instgrm.Embeds.process(): Once the component is visible and the Instagram script has loaded (making window.instgrm available), we call instgrm.Embeds.process(). This function scans the document for the instagram-media blockquotes and transforms them into interactive iframes (videos, carousels, or images) that function exactly like the original post.

isLoaded State: The post is initially hidden. A MutationObserver watches the container for the injected <iframe>. When the <iframe> appears, isLoaded is set to true, hiding the placeholder and displaying the fully rendered, interactive post.

Placeholder: A simple div with a reserved aspect ratio (paddingTop: '125%' for a square post) prevents Cumulative Layout Shift (CLS), providing a much smoother user experience while the embed loads.
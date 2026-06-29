import {
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  viewChild,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-three-background',
  standalone: true,
  template: `<div #canvasContainer class="three-canvas-container"></div>`,
  styles: [
    `
      :host {
        display: block;
        position: fixed;
        inset: 0;
        z-index: -10;
        pointer-events: none;
      }

      .three-canvas-container {
        width: 100%;
        height: 100%;
      }
    `,
  ],
})

export class ThreeBackgroundComponent implements OnDestroy {
  private readonly canvasContainer =
    viewChild.required<ElementRef<HTMLDivElement>>('canvasContainer');

  private readonly platformId = inject(PLATFORM_ID);

  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private particles: THREE.Points | null = null;
  private animationId = 0;
  private mouse = { x: 0, y: 0 };
  private targetMouse = { x: 0, y: 0 };

  constructor() {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.initScene();
        this.addMouseListener();
      }
    });
  }

  private initScene(): void {
    const container = this.canvasContainer().nativeElement;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.z = 3;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    // Particles
    this.createParticles();

    // Handle resize
    window.addEventListener('resize', this.onResize);

    // Start animation
    this.animate();
  }

  private createParticles(): void {
    const count = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    // Color palette from theme
    const colorPrimary = new THREE.Color('#c0c1ff');
    const colorSecondary = new THREE.Color('#4edea3');
    const colorTertiary = new THREE.Color('#ffb95f');

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Spread particles in a sphere-like distribution
      const radius = 2.5 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Random color from palette
      const colorChoice = Math.random();
      let color: THREE.Color;
      if (colorChoice < 0.45) {
        color = colorPrimary;
      } else if (colorChoice < 0.75) {
        color = colorSecondary;
      } else {
        color = colorTertiary;
      }

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 3 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.015,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene!.add(this.particles);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    if (!this.particles || !this.renderer || !this.scene || !this.camera) {
      return;
    }

    const time = performance.now() * 0.0001;

    // Smooth mouse follow
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    // Rotate particles slowly
    this.particles.rotation.y = time * 0.5 + this.mouse.x * 0.3;
    this.particles.rotation.x = time * 0.25 + this.mouse.y * 0.15;

    // Subtle breathing effect
    const scale = 1 + Math.sin(time * 3) * 0.02;
    this.particles.scale.set(scale, scale, scale);

    this.renderer.render(this.scene, this.camera);
  };

  private onResize = (): void => {
    if (!this.camera || !this.renderer) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private addMouseListener(): void {
    window.addEventListener('mousemove', this.onMouseMove);
  }

  private onMouseMove = (event: MouseEvent): void => {
    this.targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {

      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }


      window.removeEventListener('resize', this.onResize);
      window.removeEventListener('mousemove', this.onMouseMove);


      if (this.renderer) {
        this.renderer.dispose();
        this.renderer.domElement.remove();
      }

      if (this.particles) {
        this.particles.geometry.dispose();
        if (this.particles.material) {
          (this.particles.material as THREE.PointsMaterial).dispose();
        }
      }
    }
  }
}

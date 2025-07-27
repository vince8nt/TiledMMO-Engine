import * as THREE from 'three';
import { SpriteData, SpriteConfig } from './types';

export class SpriteManager {
    private spriteConfigs: Map<string, SpriteConfig> = new Map();
    private spriteTextures: Map<string, THREE.Texture> = new Map();
    private animatedSprites: Map<string, AnimatedSprite> = new Map();

    constructor() {}

    async loadSpriteConfigs(): Promise<void> {
        try {
            const response = await fetch('./map_data/sprites.json');
            const configs = await response.json();
            
            for (const [name, config] of Object.entries(configs)) {
                this.spriteConfigs.set(name, config as SpriteConfig);
            }
            
            console.log('Sprite configurations loaded:', Array.from(this.spriteConfigs.keys()));
        } catch (error) {
            console.error('Failed to load sprite configurations:', error);
        }
    }

    async loadSpriteTextures(): Promise<void> {
        for (const [name, config] of this.spriteConfigs) {
            try {
                if (config.type === 'animated') {
                    await this.loadSpriteSheet(name, config.texture, config.animation!.frameWidth, config.animation!.frameHeight);
                } else {
                    await this.loadSpriteTexture(name, config.texture);
                }
            } catch (error) {
                console.warn(`Failed to load sprite texture for ${name}:`, error);
            }
        }
        console.log('Sprite textures loaded successfully');
    }

    private async loadSpriteTexture(name: string, path: string): Promise<void> {
        const textureLoader = new THREE.TextureLoader();
        const texture = await textureLoader.loadAsync(path);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace; // Ensure proper color space
        this.spriteTextures.set(name, texture);
    }

    private async loadSpriteSheet(name: string, path: string, frameWidth: number, frameHeight: number): Promise<void> {
        const textureLoader = new THREE.TextureLoader();
        const texture = await textureLoader.loadAsync(path);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.SRGBColorSpace; // Ensure proper color space
        texture.repeat.set(1 / frameWidth, 1 / frameHeight);
        this.spriteTextures.set(name, texture);
    }

    createSprite(spriteData: SpriteData): THREE.Sprite | null {
        const config = this.spriteConfigs.get(spriteData.type);
        if (!config) {
            console.warn(`Sprite configuration not found: ${spriteData.type}`);
            return null;
        }

        const texture = this.spriteTextures.get(spriteData.type);
        if (!texture) {
            console.warn(`Sprite texture not found: ${spriteData.type}, skipping sprite creation`);
            return null;
        }

        try {
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: texture,
                transparent: true,
                sizeAttenuation: true,   // Sprites scale with distance (normal behavior)
                depthTest: true,         // Proper depth testing
                depthWrite: false,       // Don't write to depth buffer (sprites should be on top)
                fog: false,              // Don't apply fog to sprites
                color: 0xffffff          // Ensure white color (no tinting)
            });
            
            // Ensure sprites render with full color saturation
            spriteMaterial.toneMapped = false;
            
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.set(spriteData.x, 0.75, spriteData.y);
            
            // Apply scale (use override if provided, otherwise use config default)
            const scaleX = spriteData.scale_x !== undefined ? spriteData.scale_x : config.scale_x;
            const scaleY = spriteData.scale_y !== undefined ? spriteData.scale_y : config.scale_y;
            sprite.scale.set(scaleX, scaleY, 1);
            
            // Set layer for rendering order (use override if provided, otherwise use config default)
            const layer = spriteData.layer !== undefined ? spriteData.layer : config.layer;
            sprite.renderOrder = layer;
            
            // If animated, create animated sprite
            if (config.type === 'animated' && config.animation) {
                const animatedSprite = new AnimatedSprite(sprite, config.animation);
                this.animatedSprites.set(`${spriteData.type}_${spriteData.x}_${spriteData.y}`, animatedSprite);
            }
            
            return sprite;
        } catch (error) {
            console.error(`Failed to create sprite ${spriteData.type}:`, error);
            return null;
        }
    }

    updateAnimations(deltaTime: number): void {
        for (const animatedSprite of this.animatedSprites.values()) {
            animatedSprite.update(deltaTime);
        }
    }
}

class AnimatedSprite {
    private sprite: THREE.Sprite;
    private animation: SpriteConfig['animation'];
    private currentFrame: number = 0;
    private frameTime: number = 0;

    constructor(sprite: THREE.Sprite, animation: SpriteConfig['animation']) {
        this.sprite = sprite;
        this.animation = animation;
    }

    update(deltaTime: number): void {
        if (!this.animation) return;

        this.frameTime += deltaTime;
        if (this.frameTime >= this.animation.speed) {
            this.frameTime = 0;
            this.currentFrame = (this.currentFrame + 1) % this.animation.frames;
            
            // Update texture offset for current frame
            const material = this.sprite.material as THREE.SpriteMaterial;
            if (material.map) {
                // Calculate grid position for current frame
                const frameWidth = this.animation.frameWidth;
                const frameHeight = this.animation.frameHeight;
                
                // Calculate row and column for current frame
                const row = Math.floor(this.currentFrame / frameWidth);
                const col = this.currentFrame % frameWidth;
                
                // Set texture offset (normalized coordinates)
                material.map.offset.x = col / frameWidth;
                material.map.offset.y = 1 - (row + 1) / frameHeight; // Flip Y coordinate
            }
        }
    }
} 
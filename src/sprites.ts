import * as THREE from 'three';
import { SpriteData } from './types';

export class SpriteManager {
    private spriteTextures: Map<string, THREE.Texture> = new Map();
    private spriteSheets: Map<string, THREE.Texture> = new Map();
    private animatedSprites: Map<string, AnimatedSprite> = new Map();

    constructor() {}

    async loadSpriteTexture(name: string, path: string): Promise<void> {
        const textureLoader = new THREE.TextureLoader();
        const texture = await textureLoader.loadAsync(path);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        this.spriteTextures.set(name, texture);
    }

    async loadSpriteSheet(name: string, path: string, frameWidth: number, frameHeight: number): Promise<void> {
        const textureLoader = new THREE.TextureLoader();
        const texture = await textureLoader.loadAsync(path);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.repeat.set(1 / frameWidth, 1 / frameHeight);
        this.spriteSheets.set(name, texture);
    }

    createSprite(spriteData: SpriteData): THREE.Sprite | null {
        const texture = this.spriteTextures.get(spriteData.type);
        if (!texture) {
            console.warn(`Sprite texture not found: ${spriteData.type}, skipping sprite creation`);
            return null;
        }

        try {
            const spriteMaterial = new THREE.SpriteMaterial({ 
                map: texture,
                transparent: true
            });
            
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.set(spriteData.x, 0, spriteData.y);
            sprite.scale.set(1, 1, 1);
            
            // Set layer for rendering order
            sprite.renderOrder = spriteData.layer;
            
            // If animated, create animated sprite
            if (spriteData.animation) {
                const animatedSprite = new AnimatedSprite(sprite, spriteData.animation);
                this.animatedSprites.set(`${spriteData.x},${spriteData.y}`, animatedSprite);
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
    private animation: SpriteData['animation'];
    private currentFrame: number = 0;
    private frameTime: number = 0;

    constructor(sprite: THREE.Sprite, animation: SpriteData['animation']) {
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
                material.map.offset.x = this.currentFrame / this.animation.frames;
            }
        }
    }
} 
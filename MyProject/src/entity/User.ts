// src/entity/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Photo } from "./Photo";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true,  })
    username: string;

    @Column({nullable: true, })
    password: string;

    @Column()
    firstName: string;

    @Column({ nullable: true }) // Добавляем mobToken
    mobToken: string;

    @OneToMany(() => Photo, (photo) => photo.user)
    photos: Photo[]
}
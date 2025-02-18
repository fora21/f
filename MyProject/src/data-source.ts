import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Photo } from "./entity/Photo"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "192.168.55.79",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "ihatetea",
    synchronize: true,
    logging: false,
    entities: [User, Photo],
    migrations: [],
    subscribers: [],
})

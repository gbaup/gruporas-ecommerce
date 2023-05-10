import { type } from "os";


export interface JwtPayload {
    id: string;
    type?: string;

    // TODO: añadir todo lo que quieran grabar.
}

import { Observable } from 'rxjs';
import { Permiso, CreatePermisoDto, UpdatePermisoDto, PermisoQueryDto, PermisoResponse } from '../entities/permiso.entity';

export abstract class PermisoRepository {
  abstract getAll(query: PermisoQueryDto): Observable<PermisoResponse>;
  abstract getById(id: number): Observable<Permiso>;
  abstract create(permiso: CreatePermisoDto): Observable<Permiso>;
  abstract update(id: number, permiso: UpdatePermisoDto): Observable<Permiso>;
  abstract delete(id: number): Observable<void>;
  abstract getByModulo(modulo: string): Observable<Permiso[]>;
  abstract getByRecurso(recurso: string): Observable<Permiso[]>;
  abstract validateUnique(recurso: string, metodo: string, excludeId?: number): Observable<boolean>;
}
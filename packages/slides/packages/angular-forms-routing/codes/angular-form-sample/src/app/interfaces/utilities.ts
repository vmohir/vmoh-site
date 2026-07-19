export interface Miscellaneous<T> {
  miscellaneous: T;
}
export type Paginated<T extends {}> = _Paginated & T;
interface _Paginated {
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type ArrayElement<ArrayType> = ArrayType extends (infer ElementType)[] ? ElementType : never;
export type ObjElement<ObjType> = ObjType extends { [p in keyof ObjType]: infer ElementType } ? ElementType : never;
export type ObjElementKey<ObjType, Key extends keyof ObjType> = ObjType[Key];

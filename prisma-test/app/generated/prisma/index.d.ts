
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Devices
 * 
 */
export type Devices = $Result.DefaultSelection<Prisma.$DevicesPayload>
/**
 * Model SavedRoom
 * 
 */
export type SavedRoom = $Result.DefaultSelection<Prisma.$SavedRoomPayload>
/**
 * Model Settings
 * 
 */
export type Settings = $Result.DefaultSelection<Prisma.$SettingsPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const DevicesEnum: {
  ArduaESP8266: 'ArduaESP8266'
};

export type DevicesEnum = (typeof DevicesEnum)[keyof typeof DevicesEnum]


export const UserRole: {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

}

export type DevicesEnum = $Enums.DevicesEnum

export const DevicesEnum: typeof $Enums.DevicesEnum

export type UserRole = $Enums.UserRole

export const UserRole: typeof $Enums.UserRole

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Devices
 * const devices = await prisma.devices.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Devices
   * const devices = await prisma.devices.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.devices`: Exposes CRUD operations for the **Devices** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Devices
    * const devices = await prisma.devices.findMany()
    * ```
    */
  get devices(): Prisma.DevicesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.savedRoom`: Exposes CRUD operations for the **SavedRoom** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SavedRooms
    * const savedRooms = await prisma.savedRoom.findMany()
    * ```
    */
  get savedRoom(): Prisma.SavedRoomDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.settings`: Exposes CRUD operations for the **Settings** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Settings
    * const settings = await prisma.settings.findMany()
    * ```
    */
  get settings(): Prisma.SettingsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.9.0
   * Query Engine version: 81e4af48011447c3cc503a190e86995b66d2a28e
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Devices: 'Devices',
    SavedRoom: 'SavedRoom',
    Settings: 'Settings',
    User: 'User'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "devices" | "savedRoom" | "settings" | "user"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Devices: {
        payload: Prisma.$DevicesPayload<ExtArgs>
        fields: Prisma.DevicesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DevicesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DevicesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicesPayload>
          }
          findFirst: {
            args: Prisma.DevicesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DevicesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicesPayload>
          }
          findMany: {
            args: Prisma.DevicesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicesPayload>[]
          }
          create: {
            args: Prisma.DevicesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicesPayload>
          }
          createMany: {
            args: Prisma.DevicesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DevicesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicesPayload>[]
          }
          delete: {
            args: Prisma.DevicesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicesPayload>
          }
          update: {
            args: Prisma.DevicesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicesPayload>
          }
          deleteMany: {
            args: Prisma.DevicesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DevicesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DevicesUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicesPayload>[]
          }
          upsert: {
            args: Prisma.DevicesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DevicesPayload>
          }
          aggregate: {
            args: Prisma.DevicesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDevices>
          }
          groupBy: {
            args: Prisma.DevicesGroupByArgs<ExtArgs>
            result: $Utils.Optional<DevicesGroupByOutputType>[]
          }
          count: {
            args: Prisma.DevicesCountArgs<ExtArgs>
            result: $Utils.Optional<DevicesCountAggregateOutputType> | number
          }
        }
      }
      SavedRoom: {
        payload: Prisma.$SavedRoomPayload<ExtArgs>
        fields: Prisma.SavedRoomFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SavedRoomFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedRoomPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SavedRoomFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedRoomPayload>
          }
          findFirst: {
            args: Prisma.SavedRoomFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedRoomPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SavedRoomFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedRoomPayload>
          }
          findMany: {
            args: Prisma.SavedRoomFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedRoomPayload>[]
          }
          create: {
            args: Prisma.SavedRoomCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedRoomPayload>
          }
          createMany: {
            args: Prisma.SavedRoomCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SavedRoomCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedRoomPayload>[]
          }
          delete: {
            args: Prisma.SavedRoomDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedRoomPayload>
          }
          update: {
            args: Prisma.SavedRoomUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedRoomPayload>
          }
          deleteMany: {
            args: Prisma.SavedRoomDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SavedRoomUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SavedRoomUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedRoomPayload>[]
          }
          upsert: {
            args: Prisma.SavedRoomUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedRoomPayload>
          }
          aggregate: {
            args: Prisma.SavedRoomAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSavedRoom>
          }
          groupBy: {
            args: Prisma.SavedRoomGroupByArgs<ExtArgs>
            result: $Utils.Optional<SavedRoomGroupByOutputType>[]
          }
          count: {
            args: Prisma.SavedRoomCountArgs<ExtArgs>
            result: $Utils.Optional<SavedRoomCountAggregateOutputType> | number
          }
        }
      }
      Settings: {
        payload: Prisma.$SettingsPayload<ExtArgs>
        fields: Prisma.SettingsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SettingsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SettingsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          findFirst: {
            args: Prisma.SettingsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SettingsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          findMany: {
            args: Prisma.SettingsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>[]
          }
          create: {
            args: Prisma.SettingsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          createMany: {
            args: Prisma.SettingsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SettingsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>[]
          }
          delete: {
            args: Prisma.SettingsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          update: {
            args: Prisma.SettingsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          deleteMany: {
            args: Prisma.SettingsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SettingsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SettingsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>[]
          }
          upsert: {
            args: Prisma.SettingsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettingsPayload>
          }
          aggregate: {
            args: Prisma.SettingsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSettings>
          }
          groupBy: {
            args: Prisma.SettingsGroupByArgs<ExtArgs>
            result: $Utils.Optional<SettingsGroupByOutputType>[]
          }
          count: {
            args: Prisma.SettingsCountArgs<ExtArgs>
            result: $Utils.Optional<SettingsCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    devices?: DevicesOmit
    savedRoom?: SavedRoomOmit
    settings?: SettingsOmit
    user?: UserOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    Devices: number
    SavedRoom: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Devices?: boolean | UserCountOutputTypeCountDevicesArgs
    SavedRoom?: boolean | UserCountOutputTypeCountSavedRoomArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountDevicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DevicesWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSavedRoomArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SavedRoomWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Devices
   */

  export type AggregateDevices = {
    _count: DevicesCountAggregateOutputType | null
    _avg: DevicesAvgAggregateOutputType | null
    _sum: DevicesSumAggregateOutputType | null
    _min: DevicesMinAggregateOutputType | null
    _max: DevicesMaxAggregateOutputType | null
  }

  export type DevicesAvgAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type DevicesSumAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type DevicesMinAggregateOutputType = {
    id: number | null
    userId: number | null
    diviceName: string | null
    devicesEnum: $Enums.DevicesEnum | null
    idDeviceAr: string | null
    idDevice: string | null
    autoReconnect: boolean | null
    autoConnect: boolean | null
    closedDel: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DevicesMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    diviceName: string | null
    devicesEnum: $Enums.DevicesEnum | null
    idDeviceAr: string | null
    idDevice: string | null
    autoReconnect: boolean | null
    autoConnect: boolean | null
    closedDel: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DevicesCountAggregateOutputType = {
    id: number
    userId: number
    diviceName: number
    devicesEnum: number
    idDeviceAr: number
    idDevice: number
    autoReconnect: number
    autoConnect: number
    closedDel: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DevicesAvgAggregateInputType = {
    id?: true
    userId?: true
  }

  export type DevicesSumAggregateInputType = {
    id?: true
    userId?: true
  }

  export type DevicesMinAggregateInputType = {
    id?: true
    userId?: true
    diviceName?: true
    devicesEnum?: true
    idDeviceAr?: true
    idDevice?: true
    autoReconnect?: true
    autoConnect?: true
    closedDel?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DevicesMaxAggregateInputType = {
    id?: true
    userId?: true
    diviceName?: true
    devicesEnum?: true
    idDeviceAr?: true
    idDevice?: true
    autoReconnect?: true
    autoConnect?: true
    closedDel?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DevicesCountAggregateInputType = {
    id?: true
    userId?: true
    diviceName?: true
    devicesEnum?: true
    idDeviceAr?: true
    idDevice?: true
    autoReconnect?: true
    autoConnect?: true
    closedDel?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DevicesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Devices to aggregate.
     */
    where?: DevicesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Devices to fetch.
     */
    orderBy?: DevicesOrderByWithRelationInput | DevicesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DevicesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Devices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Devices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Devices
    **/
    _count?: true | DevicesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DevicesAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DevicesSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DevicesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DevicesMaxAggregateInputType
  }

  export type GetDevicesAggregateType<T extends DevicesAggregateArgs> = {
        [P in keyof T & keyof AggregateDevices]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDevices[P]>
      : GetScalarType<T[P], AggregateDevices[P]>
  }




  export type DevicesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DevicesWhereInput
    orderBy?: DevicesOrderByWithAggregationInput | DevicesOrderByWithAggregationInput[]
    by: DevicesScalarFieldEnum[] | DevicesScalarFieldEnum
    having?: DevicesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DevicesCountAggregateInputType | true
    _avg?: DevicesAvgAggregateInputType
    _sum?: DevicesSumAggregateInputType
    _min?: DevicesMinAggregateInputType
    _max?: DevicesMaxAggregateInputType
  }

  export type DevicesGroupByOutputType = {
    id: number
    userId: number
    diviceName: string | null
    devicesEnum: $Enums.DevicesEnum
    idDeviceAr: string | null
    idDevice: string
    autoReconnect: boolean
    autoConnect: boolean
    closedDel: boolean
    createdAt: Date
    updatedAt: Date
    _count: DevicesCountAggregateOutputType | null
    _avg: DevicesAvgAggregateOutputType | null
    _sum: DevicesSumAggregateOutputType | null
    _min: DevicesMinAggregateOutputType | null
    _max: DevicesMaxAggregateOutputType | null
  }

  type GetDevicesGroupByPayload<T extends DevicesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DevicesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DevicesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DevicesGroupByOutputType[P]>
            : GetScalarType<T[P], DevicesGroupByOutputType[P]>
        }
      >
    >


  export type DevicesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    diviceName?: boolean
    devicesEnum?: boolean
    idDeviceAr?: boolean
    idDevice?: boolean
    autoReconnect?: boolean
    autoConnect?: boolean
    closedDel?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    User?: boolean | UserDefaultArgs<ExtArgs>
    Settings?: boolean | Devices$SettingsArgs<ExtArgs>
  }, ExtArgs["result"]["devices"]>

  export type DevicesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    diviceName?: boolean
    devicesEnum?: boolean
    idDeviceAr?: boolean
    idDevice?: boolean
    autoReconnect?: boolean
    autoConnect?: boolean
    closedDel?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    User?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["devices"]>

  export type DevicesSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    diviceName?: boolean
    devicesEnum?: boolean
    idDeviceAr?: boolean
    idDevice?: boolean
    autoReconnect?: boolean
    autoConnect?: boolean
    closedDel?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    User?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["devices"]>

  export type DevicesSelectScalar = {
    id?: boolean
    userId?: boolean
    diviceName?: boolean
    devicesEnum?: boolean
    idDeviceAr?: boolean
    idDevice?: boolean
    autoReconnect?: boolean
    autoConnect?: boolean
    closedDel?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DevicesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "diviceName" | "devicesEnum" | "idDeviceAr" | "idDevice" | "autoReconnect" | "autoConnect" | "closedDel" | "createdAt" | "updatedAt", ExtArgs["result"]["devices"]>
  export type DevicesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    User?: boolean | UserDefaultArgs<ExtArgs>
    Settings?: boolean | Devices$SettingsArgs<ExtArgs>
  }
  export type DevicesIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    User?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type DevicesIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    User?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $DevicesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Devices"
    objects: {
      User: Prisma.$UserPayload<ExtArgs>
      Settings: Prisma.$SettingsPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: number
      diviceName: string | null
      devicesEnum: $Enums.DevicesEnum
      idDeviceAr: string | null
      idDevice: string
      autoReconnect: boolean
      autoConnect: boolean
      closedDel: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["devices"]>
    composites: {}
  }

  type DevicesGetPayload<S extends boolean | null | undefined | DevicesDefaultArgs> = $Result.GetResult<Prisma.$DevicesPayload, S>

  type DevicesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DevicesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DevicesCountAggregateInputType | true
    }

  export interface DevicesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Devices'], meta: { name: 'Devices' } }
    /**
     * Find zero or one Devices that matches the filter.
     * @param {DevicesFindUniqueArgs} args - Arguments to find a Devices
     * @example
     * // Get one Devices
     * const devices = await prisma.devices.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DevicesFindUniqueArgs>(args: SelectSubset<T, DevicesFindUniqueArgs<ExtArgs>>): Prisma__DevicesClient<$Result.GetResult<Prisma.$DevicesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Devices that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DevicesFindUniqueOrThrowArgs} args - Arguments to find a Devices
     * @example
     * // Get one Devices
     * const devices = await prisma.devices.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DevicesFindUniqueOrThrowArgs>(args: SelectSubset<T, DevicesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DevicesClient<$Result.GetResult<Prisma.$DevicesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Devices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DevicesFindFirstArgs} args - Arguments to find a Devices
     * @example
     * // Get one Devices
     * const devices = await prisma.devices.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DevicesFindFirstArgs>(args?: SelectSubset<T, DevicesFindFirstArgs<ExtArgs>>): Prisma__DevicesClient<$Result.GetResult<Prisma.$DevicesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Devices that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DevicesFindFirstOrThrowArgs} args - Arguments to find a Devices
     * @example
     * // Get one Devices
     * const devices = await prisma.devices.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DevicesFindFirstOrThrowArgs>(args?: SelectSubset<T, DevicesFindFirstOrThrowArgs<ExtArgs>>): Prisma__DevicesClient<$Result.GetResult<Prisma.$DevicesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Devices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DevicesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Devices
     * const devices = await prisma.devices.findMany()
     * 
     * // Get first 10 Devices
     * const devices = await prisma.devices.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const devicesWithIdOnly = await prisma.devices.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DevicesFindManyArgs>(args?: SelectSubset<T, DevicesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DevicesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Devices.
     * @param {DevicesCreateArgs} args - Arguments to create a Devices.
     * @example
     * // Create one Devices
     * const Devices = await prisma.devices.create({
     *   data: {
     *     // ... data to create a Devices
     *   }
     * })
     * 
     */
    create<T extends DevicesCreateArgs>(args: SelectSubset<T, DevicesCreateArgs<ExtArgs>>): Prisma__DevicesClient<$Result.GetResult<Prisma.$DevicesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Devices.
     * @param {DevicesCreateManyArgs} args - Arguments to create many Devices.
     * @example
     * // Create many Devices
     * const devices = await prisma.devices.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DevicesCreateManyArgs>(args?: SelectSubset<T, DevicesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Devices and returns the data saved in the database.
     * @param {DevicesCreateManyAndReturnArgs} args - Arguments to create many Devices.
     * @example
     * // Create many Devices
     * const devices = await prisma.devices.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Devices and only return the `id`
     * const devicesWithIdOnly = await prisma.devices.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DevicesCreateManyAndReturnArgs>(args?: SelectSubset<T, DevicesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DevicesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Devices.
     * @param {DevicesDeleteArgs} args - Arguments to delete one Devices.
     * @example
     * // Delete one Devices
     * const Devices = await prisma.devices.delete({
     *   where: {
     *     // ... filter to delete one Devices
     *   }
     * })
     * 
     */
    delete<T extends DevicesDeleteArgs>(args: SelectSubset<T, DevicesDeleteArgs<ExtArgs>>): Prisma__DevicesClient<$Result.GetResult<Prisma.$DevicesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Devices.
     * @param {DevicesUpdateArgs} args - Arguments to update one Devices.
     * @example
     * // Update one Devices
     * const devices = await prisma.devices.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DevicesUpdateArgs>(args: SelectSubset<T, DevicesUpdateArgs<ExtArgs>>): Prisma__DevicesClient<$Result.GetResult<Prisma.$DevicesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Devices.
     * @param {DevicesDeleteManyArgs} args - Arguments to filter Devices to delete.
     * @example
     * // Delete a few Devices
     * const { count } = await prisma.devices.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DevicesDeleteManyArgs>(args?: SelectSubset<T, DevicesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Devices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DevicesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Devices
     * const devices = await prisma.devices.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DevicesUpdateManyArgs>(args: SelectSubset<T, DevicesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Devices and returns the data updated in the database.
     * @param {DevicesUpdateManyAndReturnArgs} args - Arguments to update many Devices.
     * @example
     * // Update many Devices
     * const devices = await prisma.devices.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Devices and only return the `id`
     * const devicesWithIdOnly = await prisma.devices.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DevicesUpdateManyAndReturnArgs>(args: SelectSubset<T, DevicesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DevicesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Devices.
     * @param {DevicesUpsertArgs} args - Arguments to update or create a Devices.
     * @example
     * // Update or create a Devices
     * const devices = await prisma.devices.upsert({
     *   create: {
     *     // ... data to create a Devices
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Devices we want to update
     *   }
     * })
     */
    upsert<T extends DevicesUpsertArgs>(args: SelectSubset<T, DevicesUpsertArgs<ExtArgs>>): Prisma__DevicesClient<$Result.GetResult<Prisma.$DevicesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Devices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DevicesCountArgs} args - Arguments to filter Devices to count.
     * @example
     * // Count the number of Devices
     * const count = await prisma.devices.count({
     *   where: {
     *     // ... the filter for the Devices we want to count
     *   }
     * })
    **/
    count<T extends DevicesCountArgs>(
      args?: Subset<T, DevicesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DevicesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Devices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DevicesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DevicesAggregateArgs>(args: Subset<T, DevicesAggregateArgs>): Prisma.PrismaPromise<GetDevicesAggregateType<T>>

    /**
     * Group by Devices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DevicesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DevicesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DevicesGroupByArgs['orderBy'] }
        : { orderBy?: DevicesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DevicesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDevicesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Devices model
   */
  readonly fields: DevicesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Devices.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DevicesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    User<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    Settings<T extends Devices$SettingsArgs<ExtArgs> = {}>(args?: Subset<T, Devices$SettingsArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Devices model
   */
  interface DevicesFieldRefs {
    readonly id: FieldRef<"Devices", 'Int'>
    readonly userId: FieldRef<"Devices", 'Int'>
    readonly diviceName: FieldRef<"Devices", 'String'>
    readonly devicesEnum: FieldRef<"Devices", 'DevicesEnum'>
    readonly idDeviceAr: FieldRef<"Devices", 'String'>
    readonly idDevice: FieldRef<"Devices", 'String'>
    readonly autoReconnect: FieldRef<"Devices", 'Boolean'>
    readonly autoConnect: FieldRef<"Devices", 'Boolean'>
    readonly closedDel: FieldRef<"Devices", 'Boolean'>
    readonly createdAt: FieldRef<"Devices", 'DateTime'>
    readonly updatedAt: FieldRef<"Devices", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Devices findUnique
   */
  export type DevicesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devices
     */
    select?: DevicesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devices
     */
    omit?: DevicesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevicesInclude<ExtArgs> | null
    /**
     * Filter, which Devices to fetch.
     */
    where: DevicesWhereUniqueInput
  }

  /**
   * Devices findUniqueOrThrow
   */
  export type DevicesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devices
     */
    select?: DevicesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devices
     */
    omit?: DevicesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevicesInclude<ExtArgs> | null
    /**
     * Filter, which Devices to fetch.
     */
    where: DevicesWhereUniqueInput
  }

  /**
   * Devices findFirst
   */
  export type DevicesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devices
     */
    select?: DevicesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devices
     */
    omit?: DevicesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevicesInclude<ExtArgs> | null
    /**
     * Filter, which Devices to fetch.
     */
    where?: DevicesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Devices to fetch.
     */
    orderBy?: DevicesOrderByWithRelationInput | DevicesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Devices.
     */
    cursor?: DevicesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Devices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Devices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Devices.
     */
    distinct?: DevicesScalarFieldEnum | DevicesScalarFieldEnum[]
  }

  /**
   * Devices findFirstOrThrow
   */
  export type DevicesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devices
     */
    select?: DevicesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devices
     */
    omit?: DevicesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevicesInclude<ExtArgs> | null
    /**
     * Filter, which Devices to fetch.
     */
    where?: DevicesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Devices to fetch.
     */
    orderBy?: DevicesOrderByWithRelationInput | DevicesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Devices.
     */
    cursor?: DevicesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Devices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Devices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Devices.
     */
    distinct?: DevicesScalarFieldEnum | DevicesScalarFieldEnum[]
  }

  /**
   * Devices findMany
   */
  export type DevicesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devices
     */
    select?: DevicesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devices
     */
    omit?: DevicesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevicesInclude<ExtArgs> | null
    /**
     * Filter, which Devices to fetch.
     */
    where?: DevicesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Devices to fetch.
     */
    orderBy?: DevicesOrderByWithRelationInput | DevicesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Devices.
     */
    cursor?: DevicesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Devices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Devices.
     */
    skip?: number
    distinct?: DevicesScalarFieldEnum | DevicesScalarFieldEnum[]
  }

  /**
   * Devices create
   */
  export type DevicesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devices
     */
    select?: DevicesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devices
     */
    omit?: DevicesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevicesInclude<ExtArgs> | null
    /**
     * The data needed to create a Devices.
     */
    data: XOR<DevicesCreateInput, DevicesUncheckedCreateInput>
  }

  /**
   * Devices createMany
   */
  export type DevicesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Devices.
     */
    data: DevicesCreateManyInput | DevicesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Devices createManyAndReturn
   */
  export type DevicesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devices
     */
    select?: DevicesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Devices
     */
    omit?: DevicesOmit<ExtArgs> | null
    /**
     * The data used to create many Devices.
     */
    data: DevicesCreateManyInput | DevicesCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevicesIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Devices update
   */
  export type DevicesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devices
     */
    select?: DevicesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devices
     */
    omit?: DevicesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevicesInclude<ExtArgs> | null
    /**
     * The data needed to update a Devices.
     */
    data: XOR<DevicesUpdateInput, DevicesUncheckedUpdateInput>
    /**
     * Choose, which Devices to update.
     */
    where: DevicesWhereUniqueInput
  }

  /**
   * Devices updateMany
   */
  export type DevicesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Devices.
     */
    data: XOR<DevicesUpdateManyMutationInput, DevicesUncheckedUpdateManyInput>
    /**
     * Filter which Devices to update
     */
    where?: DevicesWhereInput
    /**
     * Limit how many Devices to update.
     */
    limit?: number
  }

  /**
   * Devices updateManyAndReturn
   */
  export type DevicesUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devices
     */
    select?: DevicesSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Devices
     */
    omit?: DevicesOmit<ExtArgs> | null
    /**
     * The data used to update Devices.
     */
    data: XOR<DevicesUpdateManyMutationInput, DevicesUncheckedUpdateManyInput>
    /**
     * Filter which Devices to update
     */
    where?: DevicesWhereInput
    /**
     * Limit how many Devices to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevicesIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Devices upsert
   */
  export type DevicesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devices
     */
    select?: DevicesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devices
     */
    omit?: DevicesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevicesInclude<ExtArgs> | null
    /**
     * The filter to search for the Devices to update in case it exists.
     */
    where: DevicesWhereUniqueInput
    /**
     * In case the Devices found by the `where` argument doesn't exist, create a new Devices with this data.
     */
    create: XOR<DevicesCreateInput, DevicesUncheckedCreateInput>
    /**
     * In case the Devices was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DevicesUpdateInput, DevicesUncheckedUpdateInput>
  }

  /**
   * Devices delete
   */
  export type DevicesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devices
     */
    select?: DevicesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devices
     */
    omit?: DevicesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevicesInclude<ExtArgs> | null
    /**
     * Filter which Devices to delete.
     */
    where: DevicesWhereUniqueInput
  }

  /**
   * Devices deleteMany
   */
  export type DevicesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Devices to delete
     */
    where?: DevicesWhereInput
    /**
     * Limit how many Devices to delete.
     */
    limit?: number
  }

  /**
   * Devices.Settings
   */
  export type Devices$SettingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettingsInclude<ExtArgs> | null
    where?: SettingsWhereInput
  }

  /**
   * Devices without action
   */
  export type DevicesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devices
     */
    select?: DevicesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devices
     */
    omit?: DevicesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevicesInclude<ExtArgs> | null
  }


  /**
   * Model SavedRoom
   */

  export type AggregateSavedRoom = {
    _count: SavedRoomCountAggregateOutputType | null
    _avg: SavedRoomAvgAggregateOutputType | null
    _sum: SavedRoomSumAggregateOutputType | null
    _min: SavedRoomMinAggregateOutputType | null
    _max: SavedRoomMaxAggregateOutputType | null
  }

  export type SavedRoomAvgAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type SavedRoomSumAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type SavedRoomMinAggregateOutputType = {
    id: number | null
    userId: number | null
    roomId: string | null
    isDefault: boolean | null
    autoConnect: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SavedRoomMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    roomId: string | null
    isDefault: boolean | null
    autoConnect: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SavedRoomCountAggregateOutputType = {
    id: number
    userId: number
    roomId: number
    isDefault: number
    autoConnect: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SavedRoomAvgAggregateInputType = {
    id?: true
    userId?: true
  }

  export type SavedRoomSumAggregateInputType = {
    id?: true
    userId?: true
  }

  export type SavedRoomMinAggregateInputType = {
    id?: true
    userId?: true
    roomId?: true
    isDefault?: true
    autoConnect?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SavedRoomMaxAggregateInputType = {
    id?: true
    userId?: true
    roomId?: true
    isDefault?: true
    autoConnect?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SavedRoomCountAggregateInputType = {
    id?: true
    userId?: true
    roomId?: true
    isDefault?: true
    autoConnect?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SavedRoomAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SavedRoom to aggregate.
     */
    where?: SavedRoomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SavedRooms to fetch.
     */
    orderBy?: SavedRoomOrderByWithRelationInput | SavedRoomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SavedRoomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SavedRooms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SavedRooms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SavedRooms
    **/
    _count?: true | SavedRoomCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SavedRoomAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SavedRoomSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SavedRoomMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SavedRoomMaxAggregateInputType
  }

  export type GetSavedRoomAggregateType<T extends SavedRoomAggregateArgs> = {
        [P in keyof T & keyof AggregateSavedRoom]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSavedRoom[P]>
      : GetScalarType<T[P], AggregateSavedRoom[P]>
  }




  export type SavedRoomGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SavedRoomWhereInput
    orderBy?: SavedRoomOrderByWithAggregationInput | SavedRoomOrderByWithAggregationInput[]
    by: SavedRoomScalarFieldEnum[] | SavedRoomScalarFieldEnum
    having?: SavedRoomScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SavedRoomCountAggregateInputType | true
    _avg?: SavedRoomAvgAggregateInputType
    _sum?: SavedRoomSumAggregateInputType
    _min?: SavedRoomMinAggregateInputType
    _max?: SavedRoomMaxAggregateInputType
  }

  export type SavedRoomGroupByOutputType = {
    id: number
    userId: number
    roomId: string
    isDefault: boolean
    autoConnect: boolean
    createdAt: Date
    updatedAt: Date
    _count: SavedRoomCountAggregateOutputType | null
    _avg: SavedRoomAvgAggregateOutputType | null
    _sum: SavedRoomSumAggregateOutputType | null
    _min: SavedRoomMinAggregateOutputType | null
    _max: SavedRoomMaxAggregateOutputType | null
  }

  type GetSavedRoomGroupByPayload<T extends SavedRoomGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SavedRoomGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SavedRoomGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SavedRoomGroupByOutputType[P]>
            : GetScalarType<T[P], SavedRoomGroupByOutputType[P]>
        }
      >
    >


  export type SavedRoomSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    roomId?: boolean
    isDefault?: boolean
    autoConnect?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    User?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["savedRoom"]>

  export type SavedRoomSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    roomId?: boolean
    isDefault?: boolean
    autoConnect?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    User?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["savedRoom"]>

  export type SavedRoomSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    roomId?: boolean
    isDefault?: boolean
    autoConnect?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    User?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["savedRoom"]>

  export type SavedRoomSelectScalar = {
    id?: boolean
    userId?: boolean
    roomId?: boolean
    isDefault?: boolean
    autoConnect?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SavedRoomOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "roomId" | "isDefault" | "autoConnect" | "createdAt" | "updatedAt", ExtArgs["result"]["savedRoom"]>
  export type SavedRoomInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    User?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SavedRoomIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    User?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SavedRoomIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    User?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $SavedRoomPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SavedRoom"
    objects: {
      User: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: number
      roomId: string
      isDefault: boolean
      autoConnect: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["savedRoom"]>
    composites: {}
  }

  type SavedRoomGetPayload<S extends boolean | null | undefined | SavedRoomDefaultArgs> = $Result.GetResult<Prisma.$SavedRoomPayload, S>

  type SavedRoomCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SavedRoomFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SavedRoomCountAggregateInputType | true
    }

  export interface SavedRoomDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SavedRoom'], meta: { name: 'SavedRoom' } }
    /**
     * Find zero or one SavedRoom that matches the filter.
     * @param {SavedRoomFindUniqueArgs} args - Arguments to find a SavedRoom
     * @example
     * // Get one SavedRoom
     * const savedRoom = await prisma.savedRoom.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SavedRoomFindUniqueArgs>(args: SelectSubset<T, SavedRoomFindUniqueArgs<ExtArgs>>): Prisma__SavedRoomClient<$Result.GetResult<Prisma.$SavedRoomPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SavedRoom that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SavedRoomFindUniqueOrThrowArgs} args - Arguments to find a SavedRoom
     * @example
     * // Get one SavedRoom
     * const savedRoom = await prisma.savedRoom.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SavedRoomFindUniqueOrThrowArgs>(args: SelectSubset<T, SavedRoomFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SavedRoomClient<$Result.GetResult<Prisma.$SavedRoomPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SavedRoom that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavedRoomFindFirstArgs} args - Arguments to find a SavedRoom
     * @example
     * // Get one SavedRoom
     * const savedRoom = await prisma.savedRoom.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SavedRoomFindFirstArgs>(args?: SelectSubset<T, SavedRoomFindFirstArgs<ExtArgs>>): Prisma__SavedRoomClient<$Result.GetResult<Prisma.$SavedRoomPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SavedRoom that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavedRoomFindFirstOrThrowArgs} args - Arguments to find a SavedRoom
     * @example
     * // Get one SavedRoom
     * const savedRoom = await prisma.savedRoom.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SavedRoomFindFirstOrThrowArgs>(args?: SelectSubset<T, SavedRoomFindFirstOrThrowArgs<ExtArgs>>): Prisma__SavedRoomClient<$Result.GetResult<Prisma.$SavedRoomPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SavedRooms that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavedRoomFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SavedRooms
     * const savedRooms = await prisma.savedRoom.findMany()
     * 
     * // Get first 10 SavedRooms
     * const savedRooms = await prisma.savedRoom.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const savedRoomWithIdOnly = await prisma.savedRoom.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SavedRoomFindManyArgs>(args?: SelectSubset<T, SavedRoomFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SavedRoomPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SavedRoom.
     * @param {SavedRoomCreateArgs} args - Arguments to create a SavedRoom.
     * @example
     * // Create one SavedRoom
     * const SavedRoom = await prisma.savedRoom.create({
     *   data: {
     *     // ... data to create a SavedRoom
     *   }
     * })
     * 
     */
    create<T extends SavedRoomCreateArgs>(args: SelectSubset<T, SavedRoomCreateArgs<ExtArgs>>): Prisma__SavedRoomClient<$Result.GetResult<Prisma.$SavedRoomPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SavedRooms.
     * @param {SavedRoomCreateManyArgs} args - Arguments to create many SavedRooms.
     * @example
     * // Create many SavedRooms
     * const savedRoom = await prisma.savedRoom.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SavedRoomCreateManyArgs>(args?: SelectSubset<T, SavedRoomCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SavedRooms and returns the data saved in the database.
     * @param {SavedRoomCreateManyAndReturnArgs} args - Arguments to create many SavedRooms.
     * @example
     * // Create many SavedRooms
     * const savedRoom = await prisma.savedRoom.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SavedRooms and only return the `id`
     * const savedRoomWithIdOnly = await prisma.savedRoom.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SavedRoomCreateManyAndReturnArgs>(args?: SelectSubset<T, SavedRoomCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SavedRoomPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SavedRoom.
     * @param {SavedRoomDeleteArgs} args - Arguments to delete one SavedRoom.
     * @example
     * // Delete one SavedRoom
     * const SavedRoom = await prisma.savedRoom.delete({
     *   where: {
     *     // ... filter to delete one SavedRoom
     *   }
     * })
     * 
     */
    delete<T extends SavedRoomDeleteArgs>(args: SelectSubset<T, SavedRoomDeleteArgs<ExtArgs>>): Prisma__SavedRoomClient<$Result.GetResult<Prisma.$SavedRoomPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SavedRoom.
     * @param {SavedRoomUpdateArgs} args - Arguments to update one SavedRoom.
     * @example
     * // Update one SavedRoom
     * const savedRoom = await prisma.savedRoom.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SavedRoomUpdateArgs>(args: SelectSubset<T, SavedRoomUpdateArgs<ExtArgs>>): Prisma__SavedRoomClient<$Result.GetResult<Prisma.$SavedRoomPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SavedRooms.
     * @param {SavedRoomDeleteManyArgs} args - Arguments to filter SavedRooms to delete.
     * @example
     * // Delete a few SavedRooms
     * const { count } = await prisma.savedRoom.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SavedRoomDeleteManyArgs>(args?: SelectSubset<T, SavedRoomDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SavedRooms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavedRoomUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SavedRooms
     * const savedRoom = await prisma.savedRoom.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SavedRoomUpdateManyArgs>(args: SelectSubset<T, SavedRoomUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SavedRooms and returns the data updated in the database.
     * @param {SavedRoomUpdateManyAndReturnArgs} args - Arguments to update many SavedRooms.
     * @example
     * // Update many SavedRooms
     * const savedRoom = await prisma.savedRoom.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SavedRooms and only return the `id`
     * const savedRoomWithIdOnly = await prisma.savedRoom.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SavedRoomUpdateManyAndReturnArgs>(args: SelectSubset<T, SavedRoomUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SavedRoomPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SavedRoom.
     * @param {SavedRoomUpsertArgs} args - Arguments to update or create a SavedRoom.
     * @example
     * // Update or create a SavedRoom
     * const savedRoom = await prisma.savedRoom.upsert({
     *   create: {
     *     // ... data to create a SavedRoom
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SavedRoom we want to update
     *   }
     * })
     */
    upsert<T extends SavedRoomUpsertArgs>(args: SelectSubset<T, SavedRoomUpsertArgs<ExtArgs>>): Prisma__SavedRoomClient<$Result.GetResult<Prisma.$SavedRoomPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SavedRooms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavedRoomCountArgs} args - Arguments to filter SavedRooms to count.
     * @example
     * // Count the number of SavedRooms
     * const count = await prisma.savedRoom.count({
     *   where: {
     *     // ... the filter for the SavedRooms we want to count
     *   }
     * })
    **/
    count<T extends SavedRoomCountArgs>(
      args?: Subset<T, SavedRoomCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SavedRoomCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SavedRoom.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavedRoomAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SavedRoomAggregateArgs>(args: Subset<T, SavedRoomAggregateArgs>): Prisma.PrismaPromise<GetSavedRoomAggregateType<T>>

    /**
     * Group by SavedRoom.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavedRoomGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SavedRoomGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SavedRoomGroupByArgs['orderBy'] }
        : { orderBy?: SavedRoomGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SavedRoomGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSavedRoomGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SavedRoom model
   */
  readonly fields: SavedRoomFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SavedRoom.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SavedRoomClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    User<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SavedRoom model
   */
  interface SavedRoomFieldRefs {
    readonly id: FieldRef<"SavedRoom", 'Int'>
    readonly userId: FieldRef<"SavedRoom", 'Int'>
    readonly roomId: FieldRef<"SavedRoom", 'String'>
    readonly isDefault: FieldRef<"SavedRoom", 'Boolean'>
    readonly autoConnect: FieldRef<"SavedRoom", 'Boolean'>
    readonly createdAt: FieldRef<"SavedRoom", 'DateTime'>
    readonly updatedAt: FieldRef<"SavedRoom", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SavedRoom findUnique
   */
  export type SavedRoomFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedRoom
     */
    select?: SavedRoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SavedRoom
     */
    omit?: SavedRoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavedRoomInclude<ExtArgs> | null
    /**
     * Filter, which SavedRoom to fetch.
     */
    where: SavedRoomWhereUniqueInput
  }

  /**
   * SavedRoom findUniqueOrThrow
   */
  export type SavedRoomFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedRoom
     */
    select?: SavedRoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SavedRoom
     */
    omit?: SavedRoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavedRoomInclude<ExtArgs> | null
    /**
     * Filter, which SavedRoom to fetch.
     */
    where: SavedRoomWhereUniqueInput
  }

  /**
   * SavedRoom findFirst
   */
  export type SavedRoomFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedRoom
     */
    select?: SavedRoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SavedRoom
     */
    omit?: SavedRoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavedRoomInclude<ExtArgs> | null
    /**
     * Filter, which SavedRoom to fetch.
     */
    where?: SavedRoomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SavedRooms to fetch.
     */
    orderBy?: SavedRoomOrderByWithRelationInput | SavedRoomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SavedRooms.
     */
    cursor?: SavedRoomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SavedRooms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SavedRooms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SavedRooms.
     */
    distinct?: SavedRoomScalarFieldEnum | SavedRoomScalarFieldEnum[]
  }

  /**
   * SavedRoom findFirstOrThrow
   */
  export type SavedRoomFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedRoom
     */
    select?: SavedRoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SavedRoom
     */
    omit?: SavedRoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavedRoomInclude<ExtArgs> | null
    /**
     * Filter, which SavedRoom to fetch.
     */
    where?: SavedRoomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SavedRooms to fetch.
     */
    orderBy?: SavedRoomOrderByWithRelationInput | SavedRoomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SavedRooms.
     */
    cursor?: SavedRoomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SavedRooms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SavedRooms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SavedRooms.
     */
    distinct?: SavedRoomScalarFieldEnum | SavedRoomScalarFieldEnum[]
  }

  /**
   * SavedRoom findMany
   */
  export type SavedRoomFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedRoom
     */
    select?: SavedRoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SavedRoom
     */
    omit?: SavedRoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavedRoomInclude<ExtArgs> | null
    /**
     * Filter, which SavedRooms to fetch.
     */
    where?: SavedRoomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SavedRooms to fetch.
     */
    orderBy?: SavedRoomOrderByWithRelationInput | SavedRoomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SavedRooms.
     */
    cursor?: SavedRoomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SavedRooms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SavedRooms.
     */
    skip?: number
    distinct?: SavedRoomScalarFieldEnum | SavedRoomScalarFieldEnum[]
  }

  /**
   * SavedRoom create
   */
  export type SavedRoomCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedRoom
     */
    select?: SavedRoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SavedRoom
     */
    omit?: SavedRoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavedRoomInclude<ExtArgs> | null
    /**
     * The data needed to create a SavedRoom.
     */
    data: XOR<SavedRoomCreateInput, SavedRoomUncheckedCreateInput>
  }

  /**
   * SavedRoom createMany
   */
  export type SavedRoomCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SavedRooms.
     */
    data: SavedRoomCreateManyInput | SavedRoomCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SavedRoom createManyAndReturn
   */
  export type SavedRoomCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedRoom
     */
    select?: SavedRoomSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SavedRoom
     */
    omit?: SavedRoomOmit<ExtArgs> | null
    /**
     * The data used to create many SavedRooms.
     */
    data: SavedRoomCreateManyInput | SavedRoomCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavedRoomIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SavedRoom update
   */
  export type SavedRoomUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedRoom
     */
    select?: SavedRoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SavedRoom
     */
    omit?: SavedRoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavedRoomInclude<ExtArgs> | null
    /**
     * The data needed to update a SavedRoom.
     */
    data: XOR<SavedRoomUpdateInput, SavedRoomUncheckedUpdateInput>
    /**
     * Choose, which SavedRoom to update.
     */
    where: SavedRoomWhereUniqueInput
  }

  /**
   * SavedRoom updateMany
   */
  export type SavedRoomUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SavedRooms.
     */
    data: XOR<SavedRoomUpdateManyMutationInput, SavedRoomUncheckedUpdateManyInput>
    /**
     * Filter which SavedRooms to update
     */
    where?: SavedRoomWhereInput
    /**
     * Limit how many SavedRooms to update.
     */
    limit?: number
  }

  /**
   * SavedRoom updateManyAndReturn
   */
  export type SavedRoomUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedRoom
     */
    select?: SavedRoomSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SavedRoom
     */
    omit?: SavedRoomOmit<ExtArgs> | null
    /**
     * The data used to update SavedRooms.
     */
    data: XOR<SavedRoomUpdateManyMutationInput, SavedRoomUncheckedUpdateManyInput>
    /**
     * Filter which SavedRooms to update
     */
    where?: SavedRoomWhereInput
    /**
     * Limit how many SavedRooms to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavedRoomIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * SavedRoom upsert
   */
  export type SavedRoomUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedRoom
     */
    select?: SavedRoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SavedRoom
     */
    omit?: SavedRoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavedRoomInclude<ExtArgs> | null
    /**
     * The filter to search for the SavedRoom to update in case it exists.
     */
    where: SavedRoomWhereUniqueInput
    /**
     * In case the SavedRoom found by the `where` argument doesn't exist, create a new SavedRoom with this data.
     */
    create: XOR<SavedRoomCreateInput, SavedRoomUncheckedCreateInput>
    /**
     * In case the SavedRoom was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SavedRoomUpdateInput, SavedRoomUncheckedUpdateInput>
  }

  /**
   * SavedRoom delete
   */
  export type SavedRoomDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedRoom
     */
    select?: SavedRoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SavedRoom
     */
    omit?: SavedRoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavedRoomInclude<ExtArgs> | null
    /**
     * Filter which SavedRoom to delete.
     */
    where: SavedRoomWhereUniqueInput
  }

  /**
   * SavedRoom deleteMany
   */
  export type SavedRoomDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SavedRooms to delete
     */
    where?: SavedRoomWhereInput
    /**
     * Limit how many SavedRooms to delete.
     */
    limit?: number
  }

  /**
   * SavedRoom without action
   */
  export type SavedRoomDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedRoom
     */
    select?: SavedRoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SavedRoom
     */
    omit?: SavedRoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavedRoomInclude<ExtArgs> | null
  }


  /**
   * Model Settings
   */

  export type AggregateSettings = {
    _count: SettingsCountAggregateOutputType | null
    _avg: SettingsAvgAggregateOutputType | null
    _sum: SettingsSumAggregateOutputType | null
    _min: SettingsMinAggregateOutputType | null
    _max: SettingsMaxAggregateOutputType | null
  }

  export type SettingsAvgAggregateOutputType = {
    id: number | null
    devicesId: number | null
    servo1MinAngle: number | null
    servo1MaxAngle: number | null
    servo2MinAngle: number | null
    servo2MaxAngle: number | null
  }

  export type SettingsSumAggregateOutputType = {
    id: number | null
    devicesId: number | null
    servo1MinAngle: number | null
    servo1MaxAngle: number | null
    servo2MinAngle: number | null
    servo2MaxAngle: number | null
  }

  export type SettingsMinAggregateOutputType = {
    id: number | null
    devicesId: number | null
    servo1MinAngle: number | null
    servo1MaxAngle: number | null
    servo2MinAngle: number | null
    servo2MaxAngle: number | null
    b1: boolean | null
    b2: boolean | null
    servoView: boolean | null
  }

  export type SettingsMaxAggregateOutputType = {
    id: number | null
    devicesId: number | null
    servo1MinAngle: number | null
    servo1MaxAngle: number | null
    servo2MinAngle: number | null
    servo2MaxAngle: number | null
    b1: boolean | null
    b2: boolean | null
    servoView: boolean | null
  }

  export type SettingsCountAggregateOutputType = {
    id: number
    devicesId: number
    servo1MinAngle: number
    servo1MaxAngle: number
    servo2MinAngle: number
    servo2MaxAngle: number
    b1: number
    b2: number
    servoView: number
    _all: number
  }


  export type SettingsAvgAggregateInputType = {
    id?: true
    devicesId?: true
    servo1MinAngle?: true
    servo1MaxAngle?: true
    servo2MinAngle?: true
    servo2MaxAngle?: true
  }

  export type SettingsSumAggregateInputType = {
    id?: true
    devicesId?: true
    servo1MinAngle?: true
    servo1MaxAngle?: true
    servo2MinAngle?: true
    servo2MaxAngle?: true
  }

  export type SettingsMinAggregateInputType = {
    id?: true
    devicesId?: true
    servo1MinAngle?: true
    servo1MaxAngle?: true
    servo2MinAngle?: true
    servo2MaxAngle?: true
    b1?: true
    b2?: true
    servoView?: true
  }

  export type SettingsMaxAggregateInputType = {
    id?: true
    devicesId?: true
    servo1MinAngle?: true
    servo1MaxAngle?: true
    servo2MinAngle?: true
    servo2MaxAngle?: true
    b1?: true
    b2?: true
    servoView?: true
  }

  export type SettingsCountAggregateInputType = {
    id?: true
    devicesId?: true
    servo1MinAngle?: true
    servo1MaxAngle?: true
    servo2MinAngle?: true
    servo2MaxAngle?: true
    b1?: true
    b2?: true
    servoView?: true
    _all?: true
  }

  export type SettingsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Settings to aggregate.
     */
    where?: SettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingsOrderByWithRelationInput | SettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Settings
    **/
    _count?: true | SettingsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SettingsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SettingsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SettingsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SettingsMaxAggregateInputType
  }

  export type GetSettingsAggregateType<T extends SettingsAggregateArgs> = {
        [P in keyof T & keyof AggregateSettings]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSettings[P]>
      : GetScalarType<T[P], AggregateSettings[P]>
  }




  export type SettingsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SettingsWhereInput
    orderBy?: SettingsOrderByWithAggregationInput | SettingsOrderByWithAggregationInput[]
    by: SettingsScalarFieldEnum[] | SettingsScalarFieldEnum
    having?: SettingsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SettingsCountAggregateInputType | true
    _avg?: SettingsAvgAggregateInputType
    _sum?: SettingsSumAggregateInputType
    _min?: SettingsMinAggregateInputType
    _max?: SettingsMaxAggregateInputType
  }

  export type SettingsGroupByOutputType = {
    id: number
    devicesId: number
    servo1MinAngle: number | null
    servo1MaxAngle: number | null
    servo2MinAngle: number | null
    servo2MaxAngle: number | null
    b1: boolean
    b2: boolean
    servoView: boolean
    _count: SettingsCountAggregateOutputType | null
    _avg: SettingsAvgAggregateOutputType | null
    _sum: SettingsSumAggregateOutputType | null
    _min: SettingsMinAggregateOutputType | null
    _max: SettingsMaxAggregateOutputType | null
  }

  type GetSettingsGroupByPayload<T extends SettingsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SettingsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SettingsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SettingsGroupByOutputType[P]>
            : GetScalarType<T[P], SettingsGroupByOutputType[P]>
        }
      >
    >


  export type SettingsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    devicesId?: boolean
    servo1MinAngle?: boolean
    servo1MaxAngle?: boolean
    servo2MinAngle?: boolean
    servo2MaxAngle?: boolean
    b1?: boolean
    b2?: boolean
    servoView?: boolean
    Devices?: boolean | DevicesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["settings"]>

  export type SettingsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    devicesId?: boolean
    servo1MinAngle?: boolean
    servo1MaxAngle?: boolean
    servo2MinAngle?: boolean
    servo2MaxAngle?: boolean
    b1?: boolean
    b2?: boolean
    servoView?: boolean
    Devices?: boolean | DevicesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["settings"]>

  export type SettingsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    devicesId?: boolean
    servo1MinAngle?: boolean
    servo1MaxAngle?: boolean
    servo2MinAngle?: boolean
    servo2MaxAngle?: boolean
    b1?: boolean
    b2?: boolean
    servoView?: boolean
    Devices?: boolean | DevicesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["settings"]>

  export type SettingsSelectScalar = {
    id?: boolean
    devicesId?: boolean
    servo1MinAngle?: boolean
    servo1MaxAngle?: boolean
    servo2MinAngle?: boolean
    servo2MaxAngle?: boolean
    b1?: boolean
    b2?: boolean
    servoView?: boolean
  }

  export type SettingsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "devicesId" | "servo1MinAngle" | "servo1MaxAngle" | "servo2MinAngle" | "servo2MaxAngle" | "b1" | "b2" | "servoView", ExtArgs["result"]["settings"]>
  export type SettingsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Devices?: boolean | DevicesDefaultArgs<ExtArgs>
  }
  export type SettingsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Devices?: boolean | DevicesDefaultArgs<ExtArgs>
  }
  export type SettingsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Devices?: boolean | DevicesDefaultArgs<ExtArgs>
  }

  export type $SettingsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Settings"
    objects: {
      Devices: Prisma.$DevicesPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      devicesId: number
      servo1MinAngle: number | null
      servo1MaxAngle: number | null
      servo2MinAngle: number | null
      servo2MaxAngle: number | null
      b1: boolean
      b2: boolean
      servoView: boolean
    }, ExtArgs["result"]["settings"]>
    composites: {}
  }

  type SettingsGetPayload<S extends boolean | null | undefined | SettingsDefaultArgs> = $Result.GetResult<Prisma.$SettingsPayload, S>

  type SettingsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SettingsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SettingsCountAggregateInputType | true
    }

  export interface SettingsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Settings'], meta: { name: 'Settings' } }
    /**
     * Find zero or one Settings that matches the filter.
     * @param {SettingsFindUniqueArgs} args - Arguments to find a Settings
     * @example
     * // Get one Settings
     * const settings = await prisma.settings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SettingsFindUniqueArgs>(args: SelectSubset<T, SettingsFindUniqueArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Settings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SettingsFindUniqueOrThrowArgs} args - Arguments to find a Settings
     * @example
     * // Get one Settings
     * const settings = await prisma.settings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SettingsFindUniqueOrThrowArgs>(args: SelectSubset<T, SettingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Settings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsFindFirstArgs} args - Arguments to find a Settings
     * @example
     * // Get one Settings
     * const settings = await prisma.settings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SettingsFindFirstArgs>(args?: SelectSubset<T, SettingsFindFirstArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Settings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsFindFirstOrThrowArgs} args - Arguments to find a Settings
     * @example
     * // Get one Settings
     * const settings = await prisma.settings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SettingsFindFirstOrThrowArgs>(args?: SelectSubset<T, SettingsFindFirstOrThrowArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Settings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Settings
     * const settings = await prisma.settings.findMany()
     * 
     * // Get first 10 Settings
     * const settings = await prisma.settings.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const settingsWithIdOnly = await prisma.settings.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SettingsFindManyArgs>(args?: SelectSubset<T, SettingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Settings.
     * @param {SettingsCreateArgs} args - Arguments to create a Settings.
     * @example
     * // Create one Settings
     * const Settings = await prisma.settings.create({
     *   data: {
     *     // ... data to create a Settings
     *   }
     * })
     * 
     */
    create<T extends SettingsCreateArgs>(args: SelectSubset<T, SettingsCreateArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Settings.
     * @param {SettingsCreateManyArgs} args - Arguments to create many Settings.
     * @example
     * // Create many Settings
     * const settings = await prisma.settings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SettingsCreateManyArgs>(args?: SelectSubset<T, SettingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Settings and returns the data saved in the database.
     * @param {SettingsCreateManyAndReturnArgs} args - Arguments to create many Settings.
     * @example
     * // Create many Settings
     * const settings = await prisma.settings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Settings and only return the `id`
     * const settingsWithIdOnly = await prisma.settings.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SettingsCreateManyAndReturnArgs>(args?: SelectSubset<T, SettingsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Settings.
     * @param {SettingsDeleteArgs} args - Arguments to delete one Settings.
     * @example
     * // Delete one Settings
     * const Settings = await prisma.settings.delete({
     *   where: {
     *     // ... filter to delete one Settings
     *   }
     * })
     * 
     */
    delete<T extends SettingsDeleteArgs>(args: SelectSubset<T, SettingsDeleteArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Settings.
     * @param {SettingsUpdateArgs} args - Arguments to update one Settings.
     * @example
     * // Update one Settings
     * const settings = await prisma.settings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SettingsUpdateArgs>(args: SelectSubset<T, SettingsUpdateArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Settings.
     * @param {SettingsDeleteManyArgs} args - Arguments to filter Settings to delete.
     * @example
     * // Delete a few Settings
     * const { count } = await prisma.settings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SettingsDeleteManyArgs>(args?: SelectSubset<T, SettingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Settings
     * const settings = await prisma.settings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SettingsUpdateManyArgs>(args: SelectSubset<T, SettingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Settings and returns the data updated in the database.
     * @param {SettingsUpdateManyAndReturnArgs} args - Arguments to update many Settings.
     * @example
     * // Update many Settings
     * const settings = await prisma.settings.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Settings and only return the `id`
     * const settingsWithIdOnly = await prisma.settings.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SettingsUpdateManyAndReturnArgs>(args: SelectSubset<T, SettingsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Settings.
     * @param {SettingsUpsertArgs} args - Arguments to update or create a Settings.
     * @example
     * // Update or create a Settings
     * const settings = await prisma.settings.upsert({
     *   create: {
     *     // ... data to create a Settings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Settings we want to update
     *   }
     * })
     */
    upsert<T extends SettingsUpsertArgs>(args: SelectSubset<T, SettingsUpsertArgs<ExtArgs>>): Prisma__SettingsClient<$Result.GetResult<Prisma.$SettingsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsCountArgs} args - Arguments to filter Settings to count.
     * @example
     * // Count the number of Settings
     * const count = await prisma.settings.count({
     *   where: {
     *     // ... the filter for the Settings we want to count
     *   }
     * })
    **/
    count<T extends SettingsCountArgs>(
      args?: Subset<T, SettingsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SettingsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SettingsAggregateArgs>(args: Subset<T, SettingsAggregateArgs>): Prisma.PrismaPromise<GetSettingsAggregateType<T>>

    /**
     * Group by Settings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettingsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SettingsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SettingsGroupByArgs['orderBy'] }
        : { orderBy?: SettingsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SettingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSettingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Settings model
   */
  readonly fields: SettingsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Settings.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SettingsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    Devices<T extends DevicesDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DevicesDefaultArgs<ExtArgs>>): Prisma__DevicesClient<$Result.GetResult<Prisma.$DevicesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Settings model
   */
  interface SettingsFieldRefs {
    readonly id: FieldRef<"Settings", 'Int'>
    readonly devicesId: FieldRef<"Settings", 'Int'>
    readonly servo1MinAngle: FieldRef<"Settings", 'Int'>
    readonly servo1MaxAngle: FieldRef<"Settings", 'Int'>
    readonly servo2MinAngle: FieldRef<"Settings", 'Int'>
    readonly servo2MaxAngle: FieldRef<"Settings", 'Int'>
    readonly b1: FieldRef<"Settings", 'Boolean'>
    readonly b2: FieldRef<"Settings", 'Boolean'>
    readonly servoView: FieldRef<"Settings", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Settings findUnique
   */
  export type SettingsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettingsInclude<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where: SettingsWhereUniqueInput
  }

  /**
   * Settings findUniqueOrThrow
   */
  export type SettingsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettingsInclude<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where: SettingsWhereUniqueInput
  }

  /**
   * Settings findFirst
   */
  export type SettingsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettingsInclude<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where?: SettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingsOrderByWithRelationInput | SettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Settings.
     */
    cursor?: SettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Settings.
     */
    distinct?: SettingsScalarFieldEnum | SettingsScalarFieldEnum[]
  }

  /**
   * Settings findFirstOrThrow
   */
  export type SettingsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettingsInclude<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where?: SettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingsOrderByWithRelationInput | SettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Settings.
     */
    cursor?: SettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Settings.
     */
    distinct?: SettingsScalarFieldEnum | SettingsScalarFieldEnum[]
  }

  /**
   * Settings findMany
   */
  export type SettingsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettingsInclude<ExtArgs> | null
    /**
     * Filter, which Settings to fetch.
     */
    where?: SettingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settings to fetch.
     */
    orderBy?: SettingsOrderByWithRelationInput | SettingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Settings.
     */
    cursor?: SettingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settings.
     */
    skip?: number
    distinct?: SettingsScalarFieldEnum | SettingsScalarFieldEnum[]
  }

  /**
   * Settings create
   */
  export type SettingsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettingsInclude<ExtArgs> | null
    /**
     * The data needed to create a Settings.
     */
    data: XOR<SettingsCreateInput, SettingsUncheckedCreateInput>
  }

  /**
   * Settings createMany
   */
  export type SettingsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Settings.
     */
    data: SettingsCreateManyInput | SettingsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Settings createManyAndReturn
   */
  export type SettingsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * The data used to create many Settings.
     */
    data: SettingsCreateManyInput | SettingsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettingsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Settings update
   */
  export type SettingsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettingsInclude<ExtArgs> | null
    /**
     * The data needed to update a Settings.
     */
    data: XOR<SettingsUpdateInput, SettingsUncheckedUpdateInput>
    /**
     * Choose, which Settings to update.
     */
    where: SettingsWhereUniqueInput
  }

  /**
   * Settings updateMany
   */
  export type SettingsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Settings.
     */
    data: XOR<SettingsUpdateManyMutationInput, SettingsUncheckedUpdateManyInput>
    /**
     * Filter which Settings to update
     */
    where?: SettingsWhereInput
    /**
     * Limit how many Settings to update.
     */
    limit?: number
  }

  /**
   * Settings updateManyAndReturn
   */
  export type SettingsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * The data used to update Settings.
     */
    data: XOR<SettingsUpdateManyMutationInput, SettingsUncheckedUpdateManyInput>
    /**
     * Filter which Settings to update
     */
    where?: SettingsWhereInput
    /**
     * Limit how many Settings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettingsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Settings upsert
   */
  export type SettingsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettingsInclude<ExtArgs> | null
    /**
     * The filter to search for the Settings to update in case it exists.
     */
    where: SettingsWhereUniqueInput
    /**
     * In case the Settings found by the `where` argument doesn't exist, create a new Settings with this data.
     */
    create: XOR<SettingsCreateInput, SettingsUncheckedCreateInput>
    /**
     * In case the Settings was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SettingsUpdateInput, SettingsUncheckedUpdateInput>
  }

  /**
   * Settings delete
   */
  export type SettingsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettingsInclude<ExtArgs> | null
    /**
     * Filter which Settings to delete.
     */
    where: SettingsWhereUniqueInput
  }

  /**
   * Settings deleteMany
   */
  export type SettingsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Settings to delete
     */
    where?: SettingsWhereInput
    /**
     * Limit how many Settings to delete.
     */
    limit?: number
  }

  /**
   * Settings without action
   */
  export type SettingsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settings
     */
    select?: SettingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settings
     */
    omit?: SettingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettingsInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    fullName: string | null
    email: string | null
    provider: string | null
    providerId: string | null
    password: string | null
    role: $Enums.UserRole | null
    img: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    fullName: string | null
    email: string | null
    provider: string | null
    providerId: string | null
    password: string | null
    role: $Enums.UserRole | null
    img: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    fullName: number
    email: number
    provider: number
    providerId: number
    password: number
    role: number
    img: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    fullName?: true
    email?: true
    provider?: true
    providerId?: true
    password?: true
    role?: true
    img?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    fullName?: true
    email?: true
    provider?: true
    providerId?: true
    password?: true
    role?: true
    img?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    fullName?: true
    email?: true
    provider?: true
    providerId?: true
    password?: true
    role?: true
    img?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    fullName: string
    email: string
    provider: string | null
    providerId: string | null
    password: string
    role: $Enums.UserRole
    img: string | null
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fullName?: boolean
    email?: boolean
    provider?: boolean
    providerId?: boolean
    password?: boolean
    role?: boolean
    img?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    Devices?: boolean | User$DevicesArgs<ExtArgs>
    SavedRoom?: boolean | User$SavedRoomArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fullName?: boolean
    email?: boolean
    provider?: boolean
    providerId?: boolean
    password?: boolean
    role?: boolean
    img?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fullName?: boolean
    email?: boolean
    provider?: boolean
    providerId?: boolean
    password?: boolean
    role?: boolean
    img?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    fullName?: boolean
    email?: boolean
    provider?: boolean
    providerId?: boolean
    password?: boolean
    role?: boolean
    img?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "fullName" | "email" | "provider" | "providerId" | "password" | "role" | "img" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Devices?: boolean | User$DevicesArgs<ExtArgs>
    SavedRoom?: boolean | User$SavedRoomArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      Devices: Prisma.$DevicesPayload<ExtArgs>[]
      SavedRoom: Prisma.$SavedRoomPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      fullName: string
      email: string
      provider: string | null
      providerId: string | null
      password: string
      role: $Enums.UserRole
      img: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    Devices<T extends User$DevicesArgs<ExtArgs> = {}>(args?: Subset<T, User$DevicesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DevicesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    SavedRoom<T extends User$SavedRoomArgs<ExtArgs> = {}>(args?: Subset<T, User$SavedRoomArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SavedRoomPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly fullName: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly provider: FieldRef<"User", 'String'>
    readonly providerId: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'UserRole'>
    readonly img: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.Devices
   */
  export type User$DevicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Devices
     */
    select?: DevicesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Devices
     */
    omit?: DevicesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DevicesInclude<ExtArgs> | null
    where?: DevicesWhereInput
    orderBy?: DevicesOrderByWithRelationInput | DevicesOrderByWithRelationInput[]
    cursor?: DevicesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DevicesScalarFieldEnum | DevicesScalarFieldEnum[]
  }

  /**
   * User.SavedRoom
   */
  export type User$SavedRoomArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedRoom
     */
    select?: SavedRoomSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SavedRoom
     */
    omit?: SavedRoomOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SavedRoomInclude<ExtArgs> | null
    where?: SavedRoomWhereInput
    orderBy?: SavedRoomOrderByWithRelationInput | SavedRoomOrderByWithRelationInput[]
    cursor?: SavedRoomWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SavedRoomScalarFieldEnum | SavedRoomScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const DevicesScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    diviceName: 'diviceName',
    devicesEnum: 'devicesEnum',
    idDeviceAr: 'idDeviceAr',
    idDevice: 'idDevice',
    autoReconnect: 'autoReconnect',
    autoConnect: 'autoConnect',
    closedDel: 'closedDel',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DevicesScalarFieldEnum = (typeof DevicesScalarFieldEnum)[keyof typeof DevicesScalarFieldEnum]


  export const SavedRoomScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    roomId: 'roomId',
    isDefault: 'isDefault',
    autoConnect: 'autoConnect',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SavedRoomScalarFieldEnum = (typeof SavedRoomScalarFieldEnum)[keyof typeof SavedRoomScalarFieldEnum]


  export const SettingsScalarFieldEnum: {
    id: 'id',
    devicesId: 'devicesId',
    servo1MinAngle: 'servo1MinAngle',
    servo1MaxAngle: 'servo1MaxAngle',
    servo2MinAngle: 'servo2MinAngle',
    servo2MaxAngle: 'servo2MaxAngle',
    b1: 'b1',
    b2: 'b2',
    servoView: 'servoView'
  };

  export type SettingsScalarFieldEnum = (typeof SettingsScalarFieldEnum)[keyof typeof SettingsScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    fullName: 'fullName',
    email: 'email',
    provider: 'provider',
    providerId: 'providerId',
    password: 'password',
    role: 'role',
    img: 'img',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DevicesEnum'
   */
  export type EnumDevicesEnumFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DevicesEnum'>
    


  /**
   * Reference to a field of type 'DevicesEnum[]'
   */
  export type ListEnumDevicesEnumFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DevicesEnum[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'UserRole'
   */
  export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>
    


  /**
   * Reference to a field of type 'UserRole[]'
   */
  export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type DevicesWhereInput = {
    AND?: DevicesWhereInput | DevicesWhereInput[]
    OR?: DevicesWhereInput[]
    NOT?: DevicesWhereInput | DevicesWhereInput[]
    id?: IntFilter<"Devices"> | number
    userId?: IntFilter<"Devices"> | number
    diviceName?: StringNullableFilter<"Devices"> | string | null
    devicesEnum?: EnumDevicesEnumFilter<"Devices"> | $Enums.DevicesEnum
    idDeviceAr?: StringNullableFilter<"Devices"> | string | null
    idDevice?: StringFilter<"Devices"> | string
    autoReconnect?: BoolFilter<"Devices"> | boolean
    autoConnect?: BoolFilter<"Devices"> | boolean
    closedDel?: BoolFilter<"Devices"> | boolean
    createdAt?: DateTimeFilter<"Devices"> | Date | string
    updatedAt?: DateTimeFilter<"Devices"> | Date | string
    User?: XOR<UserScalarRelationFilter, UserWhereInput>
    Settings?: XOR<SettingsNullableScalarRelationFilter, SettingsWhereInput> | null
  }

  export type DevicesOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    diviceName?: SortOrderInput | SortOrder
    devicesEnum?: SortOrder
    idDeviceAr?: SortOrderInput | SortOrder
    idDevice?: SortOrder
    autoReconnect?: SortOrder
    autoConnect?: SortOrder
    closedDel?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    User?: UserOrderByWithRelationInput
    Settings?: SettingsOrderByWithRelationInput
  }

  export type DevicesWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    idDevice?: string
    AND?: DevicesWhereInput | DevicesWhereInput[]
    OR?: DevicesWhereInput[]
    NOT?: DevicesWhereInput | DevicesWhereInput[]
    userId?: IntFilter<"Devices"> | number
    diviceName?: StringNullableFilter<"Devices"> | string | null
    devicesEnum?: EnumDevicesEnumFilter<"Devices"> | $Enums.DevicesEnum
    idDeviceAr?: StringNullableFilter<"Devices"> | string | null
    autoReconnect?: BoolFilter<"Devices"> | boolean
    autoConnect?: BoolFilter<"Devices"> | boolean
    closedDel?: BoolFilter<"Devices"> | boolean
    createdAt?: DateTimeFilter<"Devices"> | Date | string
    updatedAt?: DateTimeFilter<"Devices"> | Date | string
    User?: XOR<UserScalarRelationFilter, UserWhereInput>
    Settings?: XOR<SettingsNullableScalarRelationFilter, SettingsWhereInput> | null
  }, "id" | "idDevice">

  export type DevicesOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    diviceName?: SortOrderInput | SortOrder
    devicesEnum?: SortOrder
    idDeviceAr?: SortOrderInput | SortOrder
    idDevice?: SortOrder
    autoReconnect?: SortOrder
    autoConnect?: SortOrder
    closedDel?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DevicesCountOrderByAggregateInput
    _avg?: DevicesAvgOrderByAggregateInput
    _max?: DevicesMaxOrderByAggregateInput
    _min?: DevicesMinOrderByAggregateInput
    _sum?: DevicesSumOrderByAggregateInput
  }

  export type DevicesScalarWhereWithAggregatesInput = {
    AND?: DevicesScalarWhereWithAggregatesInput | DevicesScalarWhereWithAggregatesInput[]
    OR?: DevicesScalarWhereWithAggregatesInput[]
    NOT?: DevicesScalarWhereWithAggregatesInput | DevicesScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Devices"> | number
    userId?: IntWithAggregatesFilter<"Devices"> | number
    diviceName?: StringNullableWithAggregatesFilter<"Devices"> | string | null
    devicesEnum?: EnumDevicesEnumWithAggregatesFilter<"Devices"> | $Enums.DevicesEnum
    idDeviceAr?: StringNullableWithAggregatesFilter<"Devices"> | string | null
    idDevice?: StringWithAggregatesFilter<"Devices"> | string
    autoReconnect?: BoolWithAggregatesFilter<"Devices"> | boolean
    autoConnect?: BoolWithAggregatesFilter<"Devices"> | boolean
    closedDel?: BoolWithAggregatesFilter<"Devices"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Devices"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Devices"> | Date | string
  }

  export type SavedRoomWhereInput = {
    AND?: SavedRoomWhereInput | SavedRoomWhereInput[]
    OR?: SavedRoomWhereInput[]
    NOT?: SavedRoomWhereInput | SavedRoomWhereInput[]
    id?: IntFilter<"SavedRoom"> | number
    userId?: IntFilter<"SavedRoom"> | number
    roomId?: StringFilter<"SavedRoom"> | string
    isDefault?: BoolFilter<"SavedRoom"> | boolean
    autoConnect?: BoolFilter<"SavedRoom"> | boolean
    createdAt?: DateTimeFilter<"SavedRoom"> | Date | string
    updatedAt?: DateTimeFilter<"SavedRoom"> | Date | string
    User?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type SavedRoomOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    roomId?: SortOrder
    isDefault?: SortOrder
    autoConnect?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    User?: UserOrderByWithRelationInput
  }

  export type SavedRoomWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    roomId?: string
    AND?: SavedRoomWhereInput | SavedRoomWhereInput[]
    OR?: SavedRoomWhereInput[]
    NOT?: SavedRoomWhereInput | SavedRoomWhereInput[]
    userId?: IntFilter<"SavedRoom"> | number
    isDefault?: BoolFilter<"SavedRoom"> | boolean
    autoConnect?: BoolFilter<"SavedRoom"> | boolean
    createdAt?: DateTimeFilter<"SavedRoom"> | Date | string
    updatedAt?: DateTimeFilter<"SavedRoom"> | Date | string
    User?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "roomId">

  export type SavedRoomOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    roomId?: SortOrder
    isDefault?: SortOrder
    autoConnect?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SavedRoomCountOrderByAggregateInput
    _avg?: SavedRoomAvgOrderByAggregateInput
    _max?: SavedRoomMaxOrderByAggregateInput
    _min?: SavedRoomMinOrderByAggregateInput
    _sum?: SavedRoomSumOrderByAggregateInput
  }

  export type SavedRoomScalarWhereWithAggregatesInput = {
    AND?: SavedRoomScalarWhereWithAggregatesInput | SavedRoomScalarWhereWithAggregatesInput[]
    OR?: SavedRoomScalarWhereWithAggregatesInput[]
    NOT?: SavedRoomScalarWhereWithAggregatesInput | SavedRoomScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"SavedRoom"> | number
    userId?: IntWithAggregatesFilter<"SavedRoom"> | number
    roomId?: StringWithAggregatesFilter<"SavedRoom"> | string
    isDefault?: BoolWithAggregatesFilter<"SavedRoom"> | boolean
    autoConnect?: BoolWithAggregatesFilter<"SavedRoom"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"SavedRoom"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SavedRoom"> | Date | string
  }

  export type SettingsWhereInput = {
    AND?: SettingsWhereInput | SettingsWhereInput[]
    OR?: SettingsWhereInput[]
    NOT?: SettingsWhereInput | SettingsWhereInput[]
    id?: IntFilter<"Settings"> | number
    devicesId?: IntFilter<"Settings"> | number
    servo1MinAngle?: IntNullableFilter<"Settings"> | number | null
    servo1MaxAngle?: IntNullableFilter<"Settings"> | number | null
    servo2MinAngle?: IntNullableFilter<"Settings"> | number | null
    servo2MaxAngle?: IntNullableFilter<"Settings"> | number | null
    b1?: BoolFilter<"Settings"> | boolean
    b2?: BoolFilter<"Settings"> | boolean
    servoView?: BoolFilter<"Settings"> | boolean
    Devices?: XOR<DevicesScalarRelationFilter, DevicesWhereInput>
  }

  export type SettingsOrderByWithRelationInput = {
    id?: SortOrder
    devicesId?: SortOrder
    servo1MinAngle?: SortOrderInput | SortOrder
    servo1MaxAngle?: SortOrderInput | SortOrder
    servo2MinAngle?: SortOrderInput | SortOrder
    servo2MaxAngle?: SortOrderInput | SortOrder
    b1?: SortOrder
    b2?: SortOrder
    servoView?: SortOrder
    Devices?: DevicesOrderByWithRelationInput
  }

  export type SettingsWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    devicesId?: number
    AND?: SettingsWhereInput | SettingsWhereInput[]
    OR?: SettingsWhereInput[]
    NOT?: SettingsWhereInput | SettingsWhereInput[]
    servo1MinAngle?: IntNullableFilter<"Settings"> | number | null
    servo1MaxAngle?: IntNullableFilter<"Settings"> | number | null
    servo2MinAngle?: IntNullableFilter<"Settings"> | number | null
    servo2MaxAngle?: IntNullableFilter<"Settings"> | number | null
    b1?: BoolFilter<"Settings"> | boolean
    b2?: BoolFilter<"Settings"> | boolean
    servoView?: BoolFilter<"Settings"> | boolean
    Devices?: XOR<DevicesScalarRelationFilter, DevicesWhereInput>
  }, "id" | "devicesId">

  export type SettingsOrderByWithAggregationInput = {
    id?: SortOrder
    devicesId?: SortOrder
    servo1MinAngle?: SortOrderInput | SortOrder
    servo1MaxAngle?: SortOrderInput | SortOrder
    servo2MinAngle?: SortOrderInput | SortOrder
    servo2MaxAngle?: SortOrderInput | SortOrder
    b1?: SortOrder
    b2?: SortOrder
    servoView?: SortOrder
    _count?: SettingsCountOrderByAggregateInput
    _avg?: SettingsAvgOrderByAggregateInput
    _max?: SettingsMaxOrderByAggregateInput
    _min?: SettingsMinOrderByAggregateInput
    _sum?: SettingsSumOrderByAggregateInput
  }

  export type SettingsScalarWhereWithAggregatesInput = {
    AND?: SettingsScalarWhereWithAggregatesInput | SettingsScalarWhereWithAggregatesInput[]
    OR?: SettingsScalarWhereWithAggregatesInput[]
    NOT?: SettingsScalarWhereWithAggregatesInput | SettingsScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Settings"> | number
    devicesId?: IntWithAggregatesFilter<"Settings"> | number
    servo1MinAngle?: IntNullableWithAggregatesFilter<"Settings"> | number | null
    servo1MaxAngle?: IntNullableWithAggregatesFilter<"Settings"> | number | null
    servo2MinAngle?: IntNullableWithAggregatesFilter<"Settings"> | number | null
    servo2MaxAngle?: IntNullableWithAggregatesFilter<"Settings"> | number | null
    b1?: BoolWithAggregatesFilter<"Settings"> | boolean
    b2?: BoolWithAggregatesFilter<"Settings"> | boolean
    servoView?: BoolWithAggregatesFilter<"Settings"> | boolean
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    fullName?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    provider?: StringNullableFilter<"User"> | string | null
    providerId?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    img?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    Devices?: DevicesListRelationFilter
    SavedRoom?: SavedRoomListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    provider?: SortOrderInput | SortOrder
    providerId?: SortOrderInput | SortOrder
    password?: SortOrder
    role?: SortOrder
    img?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    Devices?: DevicesOrderByRelationAggregateInput
    SavedRoom?: SavedRoomOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    fullName?: StringFilter<"User"> | string
    provider?: StringNullableFilter<"User"> | string | null
    providerId?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    img?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    Devices?: DevicesListRelationFilter
    SavedRoom?: SavedRoomListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    provider?: SortOrderInput | SortOrder
    providerId?: SortOrderInput | SortOrder
    password?: SortOrder
    role?: SortOrder
    img?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    fullName?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    provider?: StringNullableWithAggregatesFilter<"User"> | string | null
    providerId?: StringNullableWithAggregatesFilter<"User"> | string | null
    password?: StringWithAggregatesFilter<"User"> | string
    role?: EnumUserRoleWithAggregatesFilter<"User"> | $Enums.UserRole
    img?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type DevicesCreateInput = {
    diviceName?: string | null
    devicesEnum?: $Enums.DevicesEnum
    idDeviceAr?: string | null
    idDevice: string
    autoReconnect: boolean
    autoConnect: boolean
    closedDel: boolean
    createdAt?: Date | string
    updatedAt: Date | string
    User: UserCreateNestedOneWithoutDevicesInput
    Settings?: SettingsCreateNestedOneWithoutDevicesInput
  }

  export type DevicesUncheckedCreateInput = {
    id?: number
    userId: number
    diviceName?: string | null
    devicesEnum?: $Enums.DevicesEnum
    idDeviceAr?: string | null
    idDevice: string
    autoReconnect: boolean
    autoConnect: boolean
    closedDel: boolean
    createdAt?: Date | string
    updatedAt: Date | string
    Settings?: SettingsUncheckedCreateNestedOneWithoutDevicesInput
  }

  export type DevicesUpdateInput = {
    diviceName?: NullableStringFieldUpdateOperationsInput | string | null
    devicesEnum?: EnumDevicesEnumFieldUpdateOperationsInput | $Enums.DevicesEnum
    idDeviceAr?: NullableStringFieldUpdateOperationsInput | string | null
    idDevice?: StringFieldUpdateOperationsInput | string
    autoReconnect?: BoolFieldUpdateOperationsInput | boolean
    autoConnect?: BoolFieldUpdateOperationsInput | boolean
    closedDel?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    User?: UserUpdateOneRequiredWithoutDevicesNestedInput
    Settings?: SettingsUpdateOneWithoutDevicesNestedInput
  }

  export type DevicesUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    diviceName?: NullableStringFieldUpdateOperationsInput | string | null
    devicesEnum?: EnumDevicesEnumFieldUpdateOperationsInput | $Enums.DevicesEnum
    idDeviceAr?: NullableStringFieldUpdateOperationsInput | string | null
    idDevice?: StringFieldUpdateOperationsInput | string
    autoReconnect?: BoolFieldUpdateOperationsInput | boolean
    autoConnect?: BoolFieldUpdateOperationsInput | boolean
    closedDel?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Settings?: SettingsUncheckedUpdateOneWithoutDevicesNestedInput
  }

  export type DevicesCreateManyInput = {
    id?: number
    userId: number
    diviceName?: string | null
    devicesEnum?: $Enums.DevicesEnum
    idDeviceAr?: string | null
    idDevice: string
    autoReconnect: boolean
    autoConnect: boolean
    closedDel: boolean
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type DevicesUpdateManyMutationInput = {
    diviceName?: NullableStringFieldUpdateOperationsInput | string | null
    devicesEnum?: EnumDevicesEnumFieldUpdateOperationsInput | $Enums.DevicesEnum
    idDeviceAr?: NullableStringFieldUpdateOperationsInput | string | null
    idDevice?: StringFieldUpdateOperationsInput | string
    autoReconnect?: BoolFieldUpdateOperationsInput | boolean
    autoConnect?: BoolFieldUpdateOperationsInput | boolean
    closedDel?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DevicesUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    diviceName?: NullableStringFieldUpdateOperationsInput | string | null
    devicesEnum?: EnumDevicesEnumFieldUpdateOperationsInput | $Enums.DevicesEnum
    idDeviceAr?: NullableStringFieldUpdateOperationsInput | string | null
    idDevice?: StringFieldUpdateOperationsInput | string
    autoReconnect?: BoolFieldUpdateOperationsInput | boolean
    autoConnect?: BoolFieldUpdateOperationsInput | boolean
    closedDel?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SavedRoomCreateInput = {
    roomId: string
    isDefault?: boolean
    autoConnect?: boolean
    createdAt?: Date | string
    updatedAt: Date | string
    User: UserCreateNestedOneWithoutSavedRoomInput
  }

  export type SavedRoomUncheckedCreateInput = {
    id?: number
    userId: number
    roomId: string
    isDefault?: boolean
    autoConnect?: boolean
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type SavedRoomUpdateInput = {
    roomId?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    autoConnect?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    User?: UserUpdateOneRequiredWithoutSavedRoomNestedInput
  }

  export type SavedRoomUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    roomId?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    autoConnect?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SavedRoomCreateManyInput = {
    id?: number
    userId: number
    roomId: string
    isDefault?: boolean
    autoConnect?: boolean
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type SavedRoomUpdateManyMutationInput = {
    roomId?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    autoConnect?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SavedRoomUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    roomId?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    autoConnect?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SettingsCreateInput = {
    servo1MinAngle?: number | null
    servo1MaxAngle?: number | null
    servo2MinAngle?: number | null
    servo2MaxAngle?: number | null
    b1: boolean
    b2: boolean
    servoView: boolean
    Devices: DevicesCreateNestedOneWithoutSettingsInput
  }

  export type SettingsUncheckedCreateInput = {
    id?: number
    devicesId: number
    servo1MinAngle?: number | null
    servo1MaxAngle?: number | null
    servo2MinAngle?: number | null
    servo2MaxAngle?: number | null
    b1: boolean
    b2: boolean
    servoView: boolean
  }

  export type SettingsUpdateInput = {
    servo1MinAngle?: NullableIntFieldUpdateOperationsInput | number | null
    servo1MaxAngle?: NullableIntFieldUpdateOperationsInput | number | null
    servo2MinAngle?: NullableIntFieldUpdateOperationsInput | number | null
    servo2MaxAngle?: NullableIntFieldUpdateOperationsInput | number | null
    b1?: BoolFieldUpdateOperationsInput | boolean
    b2?: BoolFieldUpdateOperationsInput | boolean
    servoView?: BoolFieldUpdateOperationsInput | boolean
    Devices?: DevicesUpdateOneRequiredWithoutSettingsNestedInput
  }

  export type SettingsUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    devicesId?: IntFieldUpdateOperationsInput | number
    servo1MinAngle?: NullableIntFieldUpdateOperationsInput | number | null
    servo1MaxAngle?: NullableIntFieldUpdateOperationsInput | number | null
    servo2MinAngle?: NullableIntFieldUpdateOperationsInput | number | null
    servo2MaxAngle?: NullableIntFieldUpdateOperationsInput | number | null
    b1?: BoolFieldUpdateOperationsInput | boolean
    b2?: BoolFieldUpdateOperationsInput | boolean
    servoView?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SettingsCreateManyInput = {
    id?: number
    devicesId: number
    servo1MinAngle?: number | null
    servo1MaxAngle?: number | null
    servo2MinAngle?: number | null
    servo2MaxAngle?: number | null
    b1: boolean
    b2: boolean
    servoView: boolean
  }

  export type SettingsUpdateManyMutationInput = {
    servo1MinAngle?: NullableIntFieldUpdateOperationsInput | number | null
    servo1MaxAngle?: NullableIntFieldUpdateOperationsInput | number | null
    servo2MinAngle?: NullableIntFieldUpdateOperationsInput | number | null
    servo2MaxAngle?: NullableIntFieldUpdateOperationsInput | number | null
    b1?: BoolFieldUpdateOperationsInput | boolean
    b2?: BoolFieldUpdateOperationsInput | boolean
    servoView?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SettingsUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    devicesId?: IntFieldUpdateOperationsInput | number
    servo1MinAngle?: NullableIntFieldUpdateOperationsInput | number | null
    servo1MaxAngle?: NullableIntFieldUpdateOperationsInput | number | null
    servo2MinAngle?: NullableIntFieldUpdateOperationsInput | number | null
    servo2MaxAngle?: NullableIntFieldUpdateOperationsInput | number | null
    b1?: BoolFieldUpdateOperationsInput | boolean
    b2?: BoolFieldUpdateOperationsInput | boolean
    servoView?: BoolFieldUpdateOperationsInput | boolean
  }

  export type UserCreateInput = {
    fullName: string
    email: string
    provider?: string | null
    providerId?: string | null
    password: string
    role?: $Enums.UserRole
    img?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
    Devices?: DevicesCreateNestedManyWithoutUserInput
    SavedRoom?: SavedRoomCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: number
    fullName: string
    email: string
    provider?: string | null
    providerId?: string | null
    password: string
    role?: $Enums.UserRole
    img?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
    Devices?: DevicesUncheckedCreateNestedManyWithoutUserInput
    SavedRoom?: SavedRoomUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    fullName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    img?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Devices?: DevicesUpdateManyWithoutUserNestedInput
    SavedRoom?: SavedRoomUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    fullName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    img?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Devices?: DevicesUncheckedUpdateManyWithoutUserNestedInput
    SavedRoom?: SavedRoomUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: number
    fullName: string
    email: string
    provider?: string | null
    providerId?: string | null
    password: string
    role?: $Enums.UserRole
    img?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type UserUpdateManyMutationInput = {
    fullName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    img?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    fullName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    img?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumDevicesEnumFilter<$PrismaModel = never> = {
    equals?: $Enums.DevicesEnum | EnumDevicesEnumFieldRefInput<$PrismaModel>
    in?: $Enums.DevicesEnum[] | ListEnumDevicesEnumFieldRefInput<$PrismaModel>
    notIn?: $Enums.DevicesEnum[] | ListEnumDevicesEnumFieldRefInput<$PrismaModel>
    not?: NestedEnumDevicesEnumFilter<$PrismaModel> | $Enums.DevicesEnum
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type SettingsNullableScalarRelationFilter = {
    is?: SettingsWhereInput | null
    isNot?: SettingsWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type DevicesCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    diviceName?: SortOrder
    devicesEnum?: SortOrder
    idDeviceAr?: SortOrder
    idDevice?: SortOrder
    autoReconnect?: SortOrder
    autoConnect?: SortOrder
    closedDel?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DevicesAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type DevicesMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    diviceName?: SortOrder
    devicesEnum?: SortOrder
    idDeviceAr?: SortOrder
    idDevice?: SortOrder
    autoReconnect?: SortOrder
    autoConnect?: SortOrder
    closedDel?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DevicesMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    diviceName?: SortOrder
    devicesEnum?: SortOrder
    idDeviceAr?: SortOrder
    idDevice?: SortOrder
    autoReconnect?: SortOrder
    autoConnect?: SortOrder
    closedDel?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DevicesSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumDevicesEnumWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DevicesEnum | EnumDevicesEnumFieldRefInput<$PrismaModel>
    in?: $Enums.DevicesEnum[] | ListEnumDevicesEnumFieldRefInput<$PrismaModel>
    notIn?: $Enums.DevicesEnum[] | ListEnumDevicesEnumFieldRefInput<$PrismaModel>
    not?: NestedEnumDevicesEnumWithAggregatesFilter<$PrismaModel> | $Enums.DevicesEnum
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDevicesEnumFilter<$PrismaModel>
    _max?: NestedEnumDevicesEnumFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type SavedRoomCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    roomId?: SortOrder
    isDefault?: SortOrder
    autoConnect?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SavedRoomAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type SavedRoomMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    roomId?: SortOrder
    isDefault?: SortOrder
    autoConnect?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SavedRoomMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    roomId?: SortOrder
    isDefault?: SortOrder
    autoConnect?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SavedRoomSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DevicesScalarRelationFilter = {
    is?: DevicesWhereInput
    isNot?: DevicesWhereInput
  }

  export type SettingsCountOrderByAggregateInput = {
    id?: SortOrder
    devicesId?: SortOrder
    servo1MinAngle?: SortOrder
    servo1MaxAngle?: SortOrder
    servo2MinAngle?: SortOrder
    servo2MaxAngle?: SortOrder
    b1?: SortOrder
    b2?: SortOrder
    servoView?: SortOrder
  }

  export type SettingsAvgOrderByAggregateInput = {
    id?: SortOrder
    devicesId?: SortOrder
    servo1MinAngle?: SortOrder
    servo1MaxAngle?: SortOrder
    servo2MinAngle?: SortOrder
    servo2MaxAngle?: SortOrder
  }

  export type SettingsMaxOrderByAggregateInput = {
    id?: SortOrder
    devicesId?: SortOrder
    servo1MinAngle?: SortOrder
    servo1MaxAngle?: SortOrder
    servo2MinAngle?: SortOrder
    servo2MaxAngle?: SortOrder
    b1?: SortOrder
    b2?: SortOrder
    servoView?: SortOrder
  }

  export type SettingsMinOrderByAggregateInput = {
    id?: SortOrder
    devicesId?: SortOrder
    servo1MinAngle?: SortOrder
    servo1MaxAngle?: SortOrder
    servo2MinAngle?: SortOrder
    servo2MaxAngle?: SortOrder
    b1?: SortOrder
    b2?: SortOrder
    servoView?: SortOrder
  }

  export type SettingsSumOrderByAggregateInput = {
    id?: SortOrder
    devicesId?: SortOrder
    servo1MinAngle?: SortOrder
    servo1MaxAngle?: SortOrder
    servo2MinAngle?: SortOrder
    servo2MaxAngle?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type EnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type DevicesListRelationFilter = {
    every?: DevicesWhereInput
    some?: DevicesWhereInput
    none?: DevicesWhereInput
  }

  export type SavedRoomListRelationFilter = {
    every?: SavedRoomWhereInput
    some?: SavedRoomWhereInput
    none?: SavedRoomWhereInput
  }

  export type DevicesOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SavedRoomOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    provider?: SortOrder
    providerId?: SortOrder
    password?: SortOrder
    role?: SortOrder
    img?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    provider?: SortOrder
    providerId?: SortOrder
    password?: SortOrder
    role?: SortOrder
    img?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    fullName?: SortOrder
    email?: SortOrder
    provider?: SortOrder
    providerId?: SortOrder
    password?: SortOrder
    role?: SortOrder
    img?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type EnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type UserCreateNestedOneWithoutDevicesInput = {
    create?: XOR<UserCreateWithoutDevicesInput, UserUncheckedCreateWithoutDevicesInput>
    connectOrCreate?: UserCreateOrConnectWithoutDevicesInput
    connect?: UserWhereUniqueInput
  }

  export type SettingsCreateNestedOneWithoutDevicesInput = {
    create?: XOR<SettingsCreateWithoutDevicesInput, SettingsUncheckedCreateWithoutDevicesInput>
    connectOrCreate?: SettingsCreateOrConnectWithoutDevicesInput
    connect?: SettingsWhereUniqueInput
  }

  export type SettingsUncheckedCreateNestedOneWithoutDevicesInput = {
    create?: XOR<SettingsCreateWithoutDevicesInput, SettingsUncheckedCreateWithoutDevicesInput>
    connectOrCreate?: SettingsCreateOrConnectWithoutDevicesInput
    connect?: SettingsWhereUniqueInput
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumDevicesEnumFieldUpdateOperationsInput = {
    set?: $Enums.DevicesEnum
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateOneRequiredWithoutDevicesNestedInput = {
    create?: XOR<UserCreateWithoutDevicesInput, UserUncheckedCreateWithoutDevicesInput>
    connectOrCreate?: UserCreateOrConnectWithoutDevicesInput
    upsert?: UserUpsertWithoutDevicesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutDevicesInput, UserUpdateWithoutDevicesInput>, UserUncheckedUpdateWithoutDevicesInput>
  }

  export type SettingsUpdateOneWithoutDevicesNestedInput = {
    create?: XOR<SettingsCreateWithoutDevicesInput, SettingsUncheckedCreateWithoutDevicesInput>
    connectOrCreate?: SettingsCreateOrConnectWithoutDevicesInput
    upsert?: SettingsUpsertWithoutDevicesInput
    disconnect?: SettingsWhereInput | boolean
    delete?: SettingsWhereInput | boolean
    connect?: SettingsWhereUniqueInput
    update?: XOR<XOR<SettingsUpdateToOneWithWhereWithoutDevicesInput, SettingsUpdateWithoutDevicesInput>, SettingsUncheckedUpdateWithoutDevicesInput>
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type SettingsUncheckedUpdateOneWithoutDevicesNestedInput = {
    create?: XOR<SettingsCreateWithoutDevicesInput, SettingsUncheckedCreateWithoutDevicesInput>
    connectOrCreate?: SettingsCreateOrConnectWithoutDevicesInput
    upsert?: SettingsUpsertWithoutDevicesInput
    disconnect?: SettingsWhereInput | boolean
    delete?: SettingsWhereInput | boolean
    connect?: SettingsWhereUniqueInput
    update?: XOR<XOR<SettingsUpdateToOneWithWhereWithoutDevicesInput, SettingsUpdateWithoutDevicesInput>, SettingsUncheckedUpdateWithoutDevicesInput>
  }

  export type UserCreateNestedOneWithoutSavedRoomInput = {
    create?: XOR<UserCreateWithoutSavedRoomInput, UserUncheckedCreateWithoutSavedRoomInput>
    connectOrCreate?: UserCreateOrConnectWithoutSavedRoomInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutSavedRoomNestedInput = {
    create?: XOR<UserCreateWithoutSavedRoomInput, UserUncheckedCreateWithoutSavedRoomInput>
    connectOrCreate?: UserCreateOrConnectWithoutSavedRoomInput
    upsert?: UserUpsertWithoutSavedRoomInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSavedRoomInput, UserUpdateWithoutSavedRoomInput>, UserUncheckedUpdateWithoutSavedRoomInput>
  }

  export type DevicesCreateNestedOneWithoutSettingsInput = {
    create?: XOR<DevicesCreateWithoutSettingsInput, DevicesUncheckedCreateWithoutSettingsInput>
    connectOrCreate?: DevicesCreateOrConnectWithoutSettingsInput
    connect?: DevicesWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DevicesUpdateOneRequiredWithoutSettingsNestedInput = {
    create?: XOR<DevicesCreateWithoutSettingsInput, DevicesUncheckedCreateWithoutSettingsInput>
    connectOrCreate?: DevicesCreateOrConnectWithoutSettingsInput
    upsert?: DevicesUpsertWithoutSettingsInput
    connect?: DevicesWhereUniqueInput
    update?: XOR<XOR<DevicesUpdateToOneWithWhereWithoutSettingsInput, DevicesUpdateWithoutSettingsInput>, DevicesUncheckedUpdateWithoutSettingsInput>
  }

  export type DevicesCreateNestedManyWithoutUserInput = {
    create?: XOR<DevicesCreateWithoutUserInput, DevicesUncheckedCreateWithoutUserInput> | DevicesCreateWithoutUserInput[] | DevicesUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DevicesCreateOrConnectWithoutUserInput | DevicesCreateOrConnectWithoutUserInput[]
    createMany?: DevicesCreateManyUserInputEnvelope
    connect?: DevicesWhereUniqueInput | DevicesWhereUniqueInput[]
  }

  export type SavedRoomCreateNestedManyWithoutUserInput = {
    create?: XOR<SavedRoomCreateWithoutUserInput, SavedRoomUncheckedCreateWithoutUserInput> | SavedRoomCreateWithoutUserInput[] | SavedRoomUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SavedRoomCreateOrConnectWithoutUserInput | SavedRoomCreateOrConnectWithoutUserInput[]
    createMany?: SavedRoomCreateManyUserInputEnvelope
    connect?: SavedRoomWhereUniqueInput | SavedRoomWhereUniqueInput[]
  }

  export type DevicesUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<DevicesCreateWithoutUserInput, DevicesUncheckedCreateWithoutUserInput> | DevicesCreateWithoutUserInput[] | DevicesUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DevicesCreateOrConnectWithoutUserInput | DevicesCreateOrConnectWithoutUserInput[]
    createMany?: DevicesCreateManyUserInputEnvelope
    connect?: DevicesWhereUniqueInput | DevicesWhereUniqueInput[]
  }

  export type SavedRoomUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SavedRoomCreateWithoutUserInput, SavedRoomUncheckedCreateWithoutUserInput> | SavedRoomCreateWithoutUserInput[] | SavedRoomUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SavedRoomCreateOrConnectWithoutUserInput | SavedRoomCreateOrConnectWithoutUserInput[]
    createMany?: SavedRoomCreateManyUserInputEnvelope
    connect?: SavedRoomWhereUniqueInput | SavedRoomWhereUniqueInput[]
  }

  export type EnumUserRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserRole
  }

  export type DevicesUpdateManyWithoutUserNestedInput = {
    create?: XOR<DevicesCreateWithoutUserInput, DevicesUncheckedCreateWithoutUserInput> | DevicesCreateWithoutUserInput[] | DevicesUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DevicesCreateOrConnectWithoutUserInput | DevicesCreateOrConnectWithoutUserInput[]
    upsert?: DevicesUpsertWithWhereUniqueWithoutUserInput | DevicesUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: DevicesCreateManyUserInputEnvelope
    set?: DevicesWhereUniqueInput | DevicesWhereUniqueInput[]
    disconnect?: DevicesWhereUniqueInput | DevicesWhereUniqueInput[]
    delete?: DevicesWhereUniqueInput | DevicesWhereUniqueInput[]
    connect?: DevicesWhereUniqueInput | DevicesWhereUniqueInput[]
    update?: DevicesUpdateWithWhereUniqueWithoutUserInput | DevicesUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: DevicesUpdateManyWithWhereWithoutUserInput | DevicesUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: DevicesScalarWhereInput | DevicesScalarWhereInput[]
  }

  export type SavedRoomUpdateManyWithoutUserNestedInput = {
    create?: XOR<SavedRoomCreateWithoutUserInput, SavedRoomUncheckedCreateWithoutUserInput> | SavedRoomCreateWithoutUserInput[] | SavedRoomUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SavedRoomCreateOrConnectWithoutUserInput | SavedRoomCreateOrConnectWithoutUserInput[]
    upsert?: SavedRoomUpsertWithWhereUniqueWithoutUserInput | SavedRoomUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SavedRoomCreateManyUserInputEnvelope
    set?: SavedRoomWhereUniqueInput | SavedRoomWhereUniqueInput[]
    disconnect?: SavedRoomWhereUniqueInput | SavedRoomWhereUniqueInput[]
    delete?: SavedRoomWhereUniqueInput | SavedRoomWhereUniqueInput[]
    connect?: SavedRoomWhereUniqueInput | SavedRoomWhereUniqueInput[]
    update?: SavedRoomUpdateWithWhereUniqueWithoutUserInput | SavedRoomUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SavedRoomUpdateManyWithWhereWithoutUserInput | SavedRoomUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SavedRoomScalarWhereInput | SavedRoomScalarWhereInput[]
  }

  export type DevicesUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<DevicesCreateWithoutUserInput, DevicesUncheckedCreateWithoutUserInput> | DevicesCreateWithoutUserInput[] | DevicesUncheckedCreateWithoutUserInput[]
    connectOrCreate?: DevicesCreateOrConnectWithoutUserInput | DevicesCreateOrConnectWithoutUserInput[]
    upsert?: DevicesUpsertWithWhereUniqueWithoutUserInput | DevicesUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: DevicesCreateManyUserInputEnvelope
    set?: DevicesWhereUniqueInput | DevicesWhereUniqueInput[]
    disconnect?: DevicesWhereUniqueInput | DevicesWhereUniqueInput[]
    delete?: DevicesWhereUniqueInput | DevicesWhereUniqueInput[]
    connect?: DevicesWhereUniqueInput | DevicesWhereUniqueInput[]
    update?: DevicesUpdateWithWhereUniqueWithoutUserInput | DevicesUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: DevicesUpdateManyWithWhereWithoutUserInput | DevicesUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: DevicesScalarWhereInput | DevicesScalarWhereInput[]
  }

  export type SavedRoomUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SavedRoomCreateWithoutUserInput, SavedRoomUncheckedCreateWithoutUserInput> | SavedRoomCreateWithoutUserInput[] | SavedRoomUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SavedRoomCreateOrConnectWithoutUserInput | SavedRoomCreateOrConnectWithoutUserInput[]
    upsert?: SavedRoomUpsertWithWhereUniqueWithoutUserInput | SavedRoomUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SavedRoomCreateManyUserInputEnvelope
    set?: SavedRoomWhereUniqueInput | SavedRoomWhereUniqueInput[]
    disconnect?: SavedRoomWhereUniqueInput | SavedRoomWhereUniqueInput[]
    delete?: SavedRoomWhereUniqueInput | SavedRoomWhereUniqueInput[]
    connect?: SavedRoomWhereUniqueInput | SavedRoomWhereUniqueInput[]
    update?: SavedRoomUpdateWithWhereUniqueWithoutUserInput | SavedRoomUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SavedRoomUpdateManyWithWhereWithoutUserInput | SavedRoomUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SavedRoomScalarWhereInput | SavedRoomScalarWhereInput[]
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumDevicesEnumFilter<$PrismaModel = never> = {
    equals?: $Enums.DevicesEnum | EnumDevicesEnumFieldRefInput<$PrismaModel>
    in?: $Enums.DevicesEnum[] | ListEnumDevicesEnumFieldRefInput<$PrismaModel>
    notIn?: $Enums.DevicesEnum[] | ListEnumDevicesEnumFieldRefInput<$PrismaModel>
    not?: NestedEnumDevicesEnumFilter<$PrismaModel> | $Enums.DevicesEnum
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumDevicesEnumWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DevicesEnum | EnumDevicesEnumFieldRefInput<$PrismaModel>
    in?: $Enums.DevicesEnum[] | ListEnumDevicesEnumFieldRefInput<$PrismaModel>
    notIn?: $Enums.DevicesEnum[] | ListEnumDevicesEnumFieldRefInput<$PrismaModel>
    not?: NestedEnumDevicesEnumWithAggregatesFilter<$PrismaModel> | $Enums.DevicesEnum
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDevicesEnumFilter<$PrismaModel>
    _max?: NestedEnumDevicesEnumFilter<$PrismaModel>
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type NestedEnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type UserCreateWithoutDevicesInput = {
    fullName: string
    email: string
    provider?: string | null
    providerId?: string | null
    password: string
    role?: $Enums.UserRole
    img?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
    SavedRoom?: SavedRoomCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutDevicesInput = {
    id?: number
    fullName: string
    email: string
    provider?: string | null
    providerId?: string | null
    password: string
    role?: $Enums.UserRole
    img?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
    SavedRoom?: SavedRoomUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutDevicesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDevicesInput, UserUncheckedCreateWithoutDevicesInput>
  }

  export type SettingsCreateWithoutDevicesInput = {
    servo1MinAngle?: number | null
    servo1MaxAngle?: number | null
    servo2MinAngle?: number | null
    servo2MaxAngle?: number | null
    b1: boolean
    b2: boolean
    servoView: boolean
  }

  export type SettingsUncheckedCreateWithoutDevicesInput = {
    id?: number
    servo1MinAngle?: number | null
    servo1MaxAngle?: number | null
    servo2MinAngle?: number | null
    servo2MaxAngle?: number | null
    b1: boolean
    b2: boolean
    servoView: boolean
  }

  export type SettingsCreateOrConnectWithoutDevicesInput = {
    where: SettingsWhereUniqueInput
    create: XOR<SettingsCreateWithoutDevicesInput, SettingsUncheckedCreateWithoutDevicesInput>
  }

  export type UserUpsertWithoutDevicesInput = {
    update: XOR<UserUpdateWithoutDevicesInput, UserUncheckedUpdateWithoutDevicesInput>
    create: XOR<UserCreateWithoutDevicesInput, UserUncheckedCreateWithoutDevicesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutDevicesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutDevicesInput, UserUncheckedUpdateWithoutDevicesInput>
  }

  export type UserUpdateWithoutDevicesInput = {
    fullName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    img?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    SavedRoom?: SavedRoomUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutDevicesInput = {
    id?: IntFieldUpdateOperationsInput | number
    fullName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    img?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    SavedRoom?: SavedRoomUncheckedUpdateManyWithoutUserNestedInput
  }

  export type SettingsUpsertWithoutDevicesInput = {
    update: XOR<SettingsUpdateWithoutDevicesInput, SettingsUncheckedUpdateWithoutDevicesInput>
    create: XOR<SettingsCreateWithoutDevicesInput, SettingsUncheckedCreateWithoutDevicesInput>
    where?: SettingsWhereInput
  }

  export type SettingsUpdateToOneWithWhereWithoutDevicesInput = {
    where?: SettingsWhereInput
    data: XOR<SettingsUpdateWithoutDevicesInput, SettingsUncheckedUpdateWithoutDevicesInput>
  }

  export type SettingsUpdateWithoutDevicesInput = {
    servo1MinAngle?: NullableIntFieldUpdateOperationsInput | number | null
    servo1MaxAngle?: NullableIntFieldUpdateOperationsInput | number | null
    servo2MinAngle?: NullableIntFieldUpdateOperationsInput | number | null
    servo2MaxAngle?: NullableIntFieldUpdateOperationsInput | number | null
    b1?: BoolFieldUpdateOperationsInput | boolean
    b2?: BoolFieldUpdateOperationsInput | boolean
    servoView?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SettingsUncheckedUpdateWithoutDevicesInput = {
    id?: IntFieldUpdateOperationsInput | number
    servo1MinAngle?: NullableIntFieldUpdateOperationsInput | number | null
    servo1MaxAngle?: NullableIntFieldUpdateOperationsInput | number | null
    servo2MinAngle?: NullableIntFieldUpdateOperationsInput | number | null
    servo2MaxAngle?: NullableIntFieldUpdateOperationsInput | number | null
    b1?: BoolFieldUpdateOperationsInput | boolean
    b2?: BoolFieldUpdateOperationsInput | boolean
    servoView?: BoolFieldUpdateOperationsInput | boolean
  }

  export type UserCreateWithoutSavedRoomInput = {
    fullName: string
    email: string
    provider?: string | null
    providerId?: string | null
    password: string
    role?: $Enums.UserRole
    img?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
    Devices?: DevicesCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSavedRoomInput = {
    id?: number
    fullName: string
    email: string
    provider?: string | null
    providerId?: string | null
    password: string
    role?: $Enums.UserRole
    img?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
    Devices?: DevicesUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSavedRoomInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSavedRoomInput, UserUncheckedCreateWithoutSavedRoomInput>
  }

  export type UserUpsertWithoutSavedRoomInput = {
    update: XOR<UserUpdateWithoutSavedRoomInput, UserUncheckedUpdateWithoutSavedRoomInput>
    create: XOR<UserCreateWithoutSavedRoomInput, UserUncheckedCreateWithoutSavedRoomInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSavedRoomInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSavedRoomInput, UserUncheckedUpdateWithoutSavedRoomInput>
  }

  export type UserUpdateWithoutSavedRoomInput = {
    fullName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    img?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Devices?: DevicesUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSavedRoomInput = {
    id?: IntFieldUpdateOperationsInput | number
    fullName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    provider?: NullableStringFieldUpdateOperationsInput | string | null
    providerId?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    img?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Devices?: DevicesUncheckedUpdateManyWithoutUserNestedInput
  }

  export type DevicesCreateWithoutSettingsInput = {
    diviceName?: string | null
    devicesEnum?: $Enums.DevicesEnum
    idDeviceAr?: string | null
    idDevice: string
    autoReconnect: boolean
    autoConnect: boolean
    closedDel: boolean
    createdAt?: Date | string
    updatedAt: Date | string
    User: UserCreateNestedOneWithoutDevicesInput
  }

  export type DevicesUncheckedCreateWithoutSettingsInput = {
    id?: number
    userId: number
    diviceName?: string | null
    devicesEnum?: $Enums.DevicesEnum
    idDeviceAr?: string | null
    idDevice: string
    autoReconnect: boolean
    autoConnect: boolean
    closedDel: boolean
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type DevicesCreateOrConnectWithoutSettingsInput = {
    where: DevicesWhereUniqueInput
    create: XOR<DevicesCreateWithoutSettingsInput, DevicesUncheckedCreateWithoutSettingsInput>
  }

  export type DevicesUpsertWithoutSettingsInput = {
    update: XOR<DevicesUpdateWithoutSettingsInput, DevicesUncheckedUpdateWithoutSettingsInput>
    create: XOR<DevicesCreateWithoutSettingsInput, DevicesUncheckedCreateWithoutSettingsInput>
    where?: DevicesWhereInput
  }

  export type DevicesUpdateToOneWithWhereWithoutSettingsInput = {
    where?: DevicesWhereInput
    data: XOR<DevicesUpdateWithoutSettingsInput, DevicesUncheckedUpdateWithoutSettingsInput>
  }

  export type DevicesUpdateWithoutSettingsInput = {
    diviceName?: NullableStringFieldUpdateOperationsInput | string | null
    devicesEnum?: EnumDevicesEnumFieldUpdateOperationsInput | $Enums.DevicesEnum
    idDeviceAr?: NullableStringFieldUpdateOperationsInput | string | null
    idDevice?: StringFieldUpdateOperationsInput | string
    autoReconnect?: BoolFieldUpdateOperationsInput | boolean
    autoConnect?: BoolFieldUpdateOperationsInput | boolean
    closedDel?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    User?: UserUpdateOneRequiredWithoutDevicesNestedInput
  }

  export type DevicesUncheckedUpdateWithoutSettingsInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    diviceName?: NullableStringFieldUpdateOperationsInput | string | null
    devicesEnum?: EnumDevicesEnumFieldUpdateOperationsInput | $Enums.DevicesEnum
    idDeviceAr?: NullableStringFieldUpdateOperationsInput | string | null
    idDevice?: StringFieldUpdateOperationsInput | string
    autoReconnect?: BoolFieldUpdateOperationsInput | boolean
    autoConnect?: BoolFieldUpdateOperationsInput | boolean
    closedDel?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DevicesCreateWithoutUserInput = {
    diviceName?: string | null
    devicesEnum?: $Enums.DevicesEnum
    idDeviceAr?: string | null
    idDevice: string
    autoReconnect: boolean
    autoConnect: boolean
    closedDel: boolean
    createdAt?: Date | string
    updatedAt: Date | string
    Settings?: SettingsCreateNestedOneWithoutDevicesInput
  }

  export type DevicesUncheckedCreateWithoutUserInput = {
    id?: number
    diviceName?: string | null
    devicesEnum?: $Enums.DevicesEnum
    idDeviceAr?: string | null
    idDevice: string
    autoReconnect: boolean
    autoConnect: boolean
    closedDel: boolean
    createdAt?: Date | string
    updatedAt: Date | string
    Settings?: SettingsUncheckedCreateNestedOneWithoutDevicesInput
  }

  export type DevicesCreateOrConnectWithoutUserInput = {
    where: DevicesWhereUniqueInput
    create: XOR<DevicesCreateWithoutUserInput, DevicesUncheckedCreateWithoutUserInput>
  }

  export type DevicesCreateManyUserInputEnvelope = {
    data: DevicesCreateManyUserInput | DevicesCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type SavedRoomCreateWithoutUserInput = {
    roomId: string
    isDefault?: boolean
    autoConnect?: boolean
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type SavedRoomUncheckedCreateWithoutUserInput = {
    id?: number
    roomId: string
    isDefault?: boolean
    autoConnect?: boolean
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type SavedRoomCreateOrConnectWithoutUserInput = {
    where: SavedRoomWhereUniqueInput
    create: XOR<SavedRoomCreateWithoutUserInput, SavedRoomUncheckedCreateWithoutUserInput>
  }

  export type SavedRoomCreateManyUserInputEnvelope = {
    data: SavedRoomCreateManyUserInput | SavedRoomCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type DevicesUpsertWithWhereUniqueWithoutUserInput = {
    where: DevicesWhereUniqueInput
    update: XOR<DevicesUpdateWithoutUserInput, DevicesUncheckedUpdateWithoutUserInput>
    create: XOR<DevicesCreateWithoutUserInput, DevicesUncheckedCreateWithoutUserInput>
  }

  export type DevicesUpdateWithWhereUniqueWithoutUserInput = {
    where: DevicesWhereUniqueInput
    data: XOR<DevicesUpdateWithoutUserInput, DevicesUncheckedUpdateWithoutUserInput>
  }

  export type DevicesUpdateManyWithWhereWithoutUserInput = {
    where: DevicesScalarWhereInput
    data: XOR<DevicesUpdateManyMutationInput, DevicesUncheckedUpdateManyWithoutUserInput>
  }

  export type DevicesScalarWhereInput = {
    AND?: DevicesScalarWhereInput | DevicesScalarWhereInput[]
    OR?: DevicesScalarWhereInput[]
    NOT?: DevicesScalarWhereInput | DevicesScalarWhereInput[]
    id?: IntFilter<"Devices"> | number
    userId?: IntFilter<"Devices"> | number
    diviceName?: StringNullableFilter<"Devices"> | string | null
    devicesEnum?: EnumDevicesEnumFilter<"Devices"> | $Enums.DevicesEnum
    idDeviceAr?: StringNullableFilter<"Devices"> | string | null
    idDevice?: StringFilter<"Devices"> | string
    autoReconnect?: BoolFilter<"Devices"> | boolean
    autoConnect?: BoolFilter<"Devices"> | boolean
    closedDel?: BoolFilter<"Devices"> | boolean
    createdAt?: DateTimeFilter<"Devices"> | Date | string
    updatedAt?: DateTimeFilter<"Devices"> | Date | string
  }

  export type SavedRoomUpsertWithWhereUniqueWithoutUserInput = {
    where: SavedRoomWhereUniqueInput
    update: XOR<SavedRoomUpdateWithoutUserInput, SavedRoomUncheckedUpdateWithoutUserInput>
    create: XOR<SavedRoomCreateWithoutUserInput, SavedRoomUncheckedCreateWithoutUserInput>
  }

  export type SavedRoomUpdateWithWhereUniqueWithoutUserInput = {
    where: SavedRoomWhereUniqueInput
    data: XOR<SavedRoomUpdateWithoutUserInput, SavedRoomUncheckedUpdateWithoutUserInput>
  }

  export type SavedRoomUpdateManyWithWhereWithoutUserInput = {
    where: SavedRoomScalarWhereInput
    data: XOR<SavedRoomUpdateManyMutationInput, SavedRoomUncheckedUpdateManyWithoutUserInput>
  }

  export type SavedRoomScalarWhereInput = {
    AND?: SavedRoomScalarWhereInput | SavedRoomScalarWhereInput[]
    OR?: SavedRoomScalarWhereInput[]
    NOT?: SavedRoomScalarWhereInput | SavedRoomScalarWhereInput[]
    id?: IntFilter<"SavedRoom"> | number
    userId?: IntFilter<"SavedRoom"> | number
    roomId?: StringFilter<"SavedRoom"> | string
    isDefault?: BoolFilter<"SavedRoom"> | boolean
    autoConnect?: BoolFilter<"SavedRoom"> | boolean
    createdAt?: DateTimeFilter<"SavedRoom"> | Date | string
    updatedAt?: DateTimeFilter<"SavedRoom"> | Date | string
  }

  export type DevicesCreateManyUserInput = {
    id?: number
    diviceName?: string | null
    devicesEnum?: $Enums.DevicesEnum
    idDeviceAr?: string | null
    idDevice: string
    autoReconnect: boolean
    autoConnect: boolean
    closedDel: boolean
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type SavedRoomCreateManyUserInput = {
    id?: number
    roomId: string
    isDefault?: boolean
    autoConnect?: boolean
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type DevicesUpdateWithoutUserInput = {
    diviceName?: NullableStringFieldUpdateOperationsInput | string | null
    devicesEnum?: EnumDevicesEnumFieldUpdateOperationsInput | $Enums.DevicesEnum
    idDeviceAr?: NullableStringFieldUpdateOperationsInput | string | null
    idDevice?: StringFieldUpdateOperationsInput | string
    autoReconnect?: BoolFieldUpdateOperationsInput | boolean
    autoConnect?: BoolFieldUpdateOperationsInput | boolean
    closedDel?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Settings?: SettingsUpdateOneWithoutDevicesNestedInput
  }

  export type DevicesUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    diviceName?: NullableStringFieldUpdateOperationsInput | string | null
    devicesEnum?: EnumDevicesEnumFieldUpdateOperationsInput | $Enums.DevicesEnum
    idDeviceAr?: NullableStringFieldUpdateOperationsInput | string | null
    idDevice?: StringFieldUpdateOperationsInput | string
    autoReconnect?: BoolFieldUpdateOperationsInput | boolean
    autoConnect?: BoolFieldUpdateOperationsInput | boolean
    closedDel?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Settings?: SettingsUncheckedUpdateOneWithoutDevicesNestedInput
  }

  export type DevicesUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    diviceName?: NullableStringFieldUpdateOperationsInput | string | null
    devicesEnum?: EnumDevicesEnumFieldUpdateOperationsInput | $Enums.DevicesEnum
    idDeviceAr?: NullableStringFieldUpdateOperationsInput | string | null
    idDevice?: StringFieldUpdateOperationsInput | string
    autoReconnect?: BoolFieldUpdateOperationsInput | boolean
    autoConnect?: BoolFieldUpdateOperationsInput | boolean
    closedDel?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SavedRoomUpdateWithoutUserInput = {
    roomId?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    autoConnect?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SavedRoomUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    roomId?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    autoConnect?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SavedRoomUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    roomId?: StringFieldUpdateOperationsInput | string
    isDefault?: BoolFieldUpdateOperationsInput | boolean
    autoConnect?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}
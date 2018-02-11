export declare namespace Model {
    type Status = {
        message?: string;
        label?: string;
    };
    type Health<T> = {
        value: T;
        invalid: boolean;
        touched: boolean;
        errors: Status[];
        notes: Status[];
        warnings: Status[];
    };
    type CheckSyncFn<T> = (value: T) => Partial<Health<T>>;
    type CheckAsyncFn<T> = (value: T) => Promise<Partial<Health<T>>>;
    type CheckFn<T> = CheckSyncFn<T> | CheckAsyncFn<T>;
    type Config<T, U = any> = {
        onUpdate: (health: Health<T>) => U;
        checks?: CheckFn<T>[];
        checkRace?: boolean;
    };
    interface IModel<T, U = any> {
        ZERO_HEALTH: Health<T>;
        update(value: T): Promise<U>;
        reset(value?: T): Promise<U>;
    }
}
export declare class Model<T, U = any> implements Model.IModel<T> {
    private _zero;
    private _value;
    private _touched;
    private _checks;
    private _onUpdate;
    /**
     * Initial health value for your state
     */
    ZERO_HEALTH: Model.Health<T>;
    /**
     * Create new Model which keeps track of changes
     * @param _zero Zero value for the model
     * @param config configuration for what to do on update, must at least include onUpdate
     */
    constructor(_zero: T, config: Model.Config<T, U>);
    update(value: T, touched?: boolean): Promise<U>;
    reset(value?: T): Promise<U>;
}
export declare function checkValueHealths<T>(value: T, checks: Model.CheckFn<T>[]): Promise<Partial<Model.Health<T>>[]>;
export declare function createZeroHealth<T>(value: T, touched?: boolean): Model.Health<T>;
export declare function combineHealths<T>(healths: Partial<Model.Health<T>>[], value: T, touched: boolean): Model.Health<T>;

export function randomChoice<Value>(values: readonly [Value, ...Value[]]): Value {
    return values[Math.floor(Math.random() * values.length)] ?? values[0];
}

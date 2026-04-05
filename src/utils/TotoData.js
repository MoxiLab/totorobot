export class TotoData extends Map {
  filter(fn) {
    const result = new TotoData();

    for (const [key, value] of this) {
      if (fn(value, key, this)) result.set(key, value);
    }

    return result;
  }

  find(fn) {
    for (const [key, value] of this) {
      if (fn(value, key, this)) return value;
    }

    return undefined;
  }

  map(fn) {
    const result = new TotoData();

    for (const [key, value] of this) {
      result.set(key, fn(value, key, this));
    }

    return result;
  }

  first() {
    return this.size ? this.values().next().value : undefined;
  }

  last() {
    if (!this.size) return undefined;

    let lastValue;
    for (const value of this.values()) lastValue = value;

    return lastValue;
  }
}

import { useMemo } from 'react';

/**
 * A custom hook that creates and caches callback functions based on index values.
 * This is useful for optimizing performance in render-heavy scenarios like lists or grids
 * where you need to pass callbacks to child components that depend on an index.
 * 
 * @template T - The type of the arguments array
 * @param callbackFn - The function to be memoized, which receives an index as the first parameter
 *                     followed by any additional arguments
 * @param argsLength - The number of additional arguments from the generated callback that should be 
 *                     passed to the original callback function
 * 
 * @returns A function that accepts an index and returns a memoized callback for that index.
 *          The returned callback will maintain reference equality between renders for the same index.
 * 
 * @example
 * // For a list where each item needs a click handler with its index
 * const getClickHandler = useMemoizedIndexCallback((index, event) => {
 *   console.log(`Item ${index} clicked`, event);
 * }, 1);
 * 
 * // In render:
 * return items.map((item, index) => (
 *   <div key={index} onClick={getClickHandler(index)}>
 *     {item.name}
 *   </div>
 * ));
 */
export const useMemoizedIndexCallback = <T extends Array<any>>(
    callbackFn: (index: number, ...args: T) => void,
    argsLength: number
) => {
    return useMemo(() => {
        const cache = new Map<number, (...args: T) => void>();

        return (index: number) => {
            if (!cache.has(index)) {
                cache.set(index, (...args) => {
                    callbackFn(index, ...(args.slice(0, argsLength) as T));
                });
            }

            return cache.get(index) as (...args: T) => void;
        };
    }, [argsLength, callbackFn]);
};

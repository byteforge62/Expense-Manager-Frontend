import { useDispatch, useSelector } from "react-redux";

/**
 * --- PRE-TYPED REDUX HOOKS ---
 * Components should import from here instead of "react-redux" directly.
 * That keeps the JSDoc types in one place and makes an eventual TypeScript
 * migration a single-file change.
 *
 * @typedef {import("./store").RootState} RootState
 * @typedef {import("./store").AppDispatch} AppDispatch
 */

/** @returns {import("./store").AppDispatch} */
export const useAppDispatch = () => useDispatch();

/**
 * Select the smallest piece of state a component needs.
 *
 * @template T
 * @param {(state: import("./store").RootState) => T} selector
 * @param {(left: T, right: T) => boolean} [equalityFn]
 * @returns {T}
 */
export const useAppSelector = (selector, equalityFn) =>
  useSelector(selector, equalityFn);

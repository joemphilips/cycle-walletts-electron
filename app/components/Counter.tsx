import xs, { Stream } from "xstream";
import { button, div, h2, span, VNode, DOMSource } from "@cycle/dom";
import { StateSource } from "cycle-onionify";

import { BaseSources, BaseSinks } from "../interfaces";

// Types
export interface Sources extends BaseSources {
  readonly onion: StateSource<State>;
}
export interface Sinks extends BaseSinks {
  readonly onion?: Stream<Reducer>;
}

// State
export interface State {
  readonly count: number;
}
export const defaultState: State = {
  count: 30
};
export type Reducer = (prev: State) => State | undefined;

export function Counter({ DOM, onion }: Sources): Sinks {
  const action$: Stream<Reducer> = intent(DOM);
  const vdom$: Stream<VNode> = view(onion.state$);

  const routes$ = DOM.select('[data-action="navigate"]')
    .events("click")
    .mapTo("/p2");

  return {
    DOM: vdom$,
    onion: action$,
    router: routes$
  };
}

function intent(DOM: DOMSource): Stream<Reducer> {
  const init$ = xs.of<Reducer>(
    prevState => (prevState === undefined ? defaultState : prevState)
  );

  const add$: Stream<Reducer> = DOM.select(".add")
    .events("click")
    .mapTo<Reducer>(state => ({ ...state, count: state.count + 1 }));

  const subtract$: Stream<Reducer> = DOM.select(".subtract")
    .events("click")
    .mapTo<Reducer>(state => ({ ...state, count: state.count - 1 }));

  return xs.merge(init$, add$, subtract$);
}

function view(state$: Stream<State>): Stream<VNode> {
  return state$.map(({ count }) =>
    div([
      h2("My Awesome Cycle.js app - Page 1"),
      span("Counter: " + count),
      button({ props: { className: "add" } }, "Increase"),
      button({ props: { className: "subtract" } }, "Decrease"),
      button(
        {
          attrs: { "data-action": "navigate" }
        },
        "Page 2"
      )
    ])
  );
}

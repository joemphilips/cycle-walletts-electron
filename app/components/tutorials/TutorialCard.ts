import { DOMSource, li, VNode, span, input } from "@cycle/dom";
import isolate from "@cycle/isolate";
import { StateSource } from "cycle-onionify";
import xs, { Stream } from "xstream";
import { BaseSinks, BaseSources, Component } from "../../interfaces";

interface Sources extends BaseSources {
  readonly onion: StateSource<State>;
}
interface Sinks extends BaseSinks {
  readonly onion: Stream<Reducer>;
}
export interface State {
  readonly id: number;
  readonly onelineExplanation: string;
  readonly isChecked: boolean;
}

export const defaultState: State = {
  id: 0,
  onelineExplanation: "this is default tutorial",
  isChecked: false
};

export type Reducer = (prev: State) => State;

const tutorialCard: Component<Sources, Sinks> = ({
  DOM,
  onion
}: Sources): Sinks => {
  const state$ = onion.state$;
  const reducer$ = model(DOM);
  return {
    DOM: view(state$),
    onion: reducer$
  };
};

export const main = (sources: Sources): Sinks => isolate(tutorialCard)(sources);

export const model = (dom$: DOMSource): Stream<Reducer> => {
  const init$ = xs.of<Reducer>(
    prevState => (typeof prevState === undefined ? defaultState : prevState)
  );

  const check$ = dom$
    .select(".checkbox")
    .events("click")
    .map(ev => (prev: State): State => ({
      ...prev,
      isChecked: !prev.isChecked // !(ev.target as HTMLInputElement).checked
    }));

  return xs.merge(init$, check$);
};

const view = (state$: Stream<State>): Stream<VNode> => {
  return state$.map(s =>
    li(`.tutorial-card`, [
      input(
        ".checkbox",
        { attrs: { type: "checkbox" }, props: { checked: s.isChecked } },
        "checkbox"
      ),
      span(".oneline-explanation", s.onelineExplanation)
    ])
  );
};

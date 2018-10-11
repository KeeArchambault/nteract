/* @flow strict */

import type { Store } from "redux";

import { selectors } from "@nteract/core";

import type { ContentRef } from "@nteract/core";

import * as actions from "./actions";

import type { DesktopNotebookAppState } from "./state.js";
import {
  DESKTOP_NOTEBOOK_CLOSING_NOT_STARTED,
  DESKTOP_NOTEBOOK_CLOSING_READY_TO_CLOSE
} from "./state.js";

export function beforeUnload(
  contentRef: ContentRef,
  store: Store<DesktopNotebookAppState, Action>
) {
  const state = store.getState();
  const model = selectors.model(state, { contentRef });

  if (!model || model.type !== "notebook") {
    // No model on the page, don't block them
    return;
  }

  const closingState = state.desktopNotebook.closingState;
  if (closingState === DESKTOP_NOTEBOOK_CLOSING_NOT_STARTED) {
    // Dispatch asynchronously since returning ASAP is imperative for canceling close/unload.
    // See https://github.com/electron/electron/issues/12668
    setTimeout(
      () => store.dispatch(actions.closeNotebook({ contentRef: contentRef })),
      0
    );
  }

  if (closingState !== DESKTOP_NOTEBOOK_CLOSING_READY_TO_CLOSE) {
    return false;
  }
}

export function initGlobalHandlers(
  contentRef: ContentRef,
  store: Store<DesktopNotebookAppState, Action>
) {
  window.onbeforeunload = beforeUnload.bind(null, contentRef, store);
}

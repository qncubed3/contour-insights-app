import { useState, useCallback } from "react";
import { MapViewState, ViewStateChangeParameters } from "@deck.gl/core";
import { INITIAL_VIEW_STATE } from "../../components/constants";

export function useViewState() {
    const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);

    const onViewStateChange = useCallback(
        ({ viewState }: ViewStateChangeParameters) => {
            setViewState(viewState as MapViewState);
        },
        []
    );

    return { viewState, onViewStateChange };
}
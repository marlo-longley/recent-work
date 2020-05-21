import {
    FETCH_CHOICES,
    RECEIVED_CHOICES,
    FAILED_CHOICES
} from '../actionTypes';
import { config } from '../store';


function fetchChoices() {
    return {
        type: FETCH_CHOICES
    }
}

function receiveChoices(choices, collectionItems) {
    return {
        type: RECEIVED_CHOICES,
        data: choices,
        collectionItems
    }
}

function failChoices(error) {
    console.error('Failed Choices Request', error);
    return {
        type: FAILED_CHOICES,
        error
    }
}

export function getChoices(collectionItems, choiceText) {
    const queryParams = {
        pgSz: 7,
        pt: choiceText
    };
    return (dispatch) => {
        dispatch(fetchChoices());

        // If a collection is specified send the request there.
        // Otherwise query all collections.
        // makeRequest() returns a Promise.
        const makeRequest = collectionItems ?
            () => config.fetchItemChoices(collectionItems, queryParams) :
            () => config.fetchAllChoices(queryParams);

        return makeRequest()
            .then(choiceData => {
                const { choices } = choiceData;
                dispatch(receiveChoices(choices, collectionItems))
            })
            .catch(error =>
                dispatch(failChoices(error))
            );
    }
}
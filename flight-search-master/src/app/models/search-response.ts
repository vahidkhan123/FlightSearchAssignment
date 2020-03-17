import { Flights } from '../models/flights';

export interface SearchResponse {
    oneWayFlights: Flights[];
    returningFlights?: Flights[];
    isEmptyResult: boolean,
    oneway: boolean;
};

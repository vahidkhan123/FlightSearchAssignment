/**
 * Define shape of search result header
 * @properties: source, destination, oneway, startDate and optional return date
*/
export interface SearchResultHeader {
  source: string,
  destination: string,
  oneWay: boolean,
  startDate: string,
  returnDate?: string
}

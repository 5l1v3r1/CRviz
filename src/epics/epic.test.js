import expect from 'expect';
import configureMockStore from 'redux-mock-store';
import configureStore from "../configure-store";
import { createEpicMiddleware } from 'redux-observable';
import { Observable, of} from 'rxjs';

import rootEpic from './root-epic'
import { setDataset } from '../domain/dataset'
import { loadDataset } from "./load-dataset-epic"
import { uploadDataset } from "./upload-dataset-epic"
import { searchDataset } from "./search-dataset-epic"
import { fetchDataset } from "./fetch-dataset-epic"
import { 
	buildIndex, 
	getSearchIndex,
	setSearchResults,
	getSearchResults
} from "./index-dataset-epic"
import fetchDatasetEpic from "./fetch-dataset-epic"

describe("loadDatasetEpic", () => {
	let store;

	beforeEach(() => {
		const epicMiddleware = createEpicMiddleware();
		const mockStore = configureMockStore([epicMiddleware]);
		store  = mockStore();
		epicMiddleware.run(rootEpic);
	});

	afterEach(() => {
		
	});

	it("loads the dataset with default config", () => {
		const data = [
		  { uid: "uid1", role: { role: "role", confidence: 80 } },
		  { uid: "uid2", role: { role: "role", confidence: 80 } }
		];

		const action$ = loadDataset(data);
		store.dispatch(action$);
		let typeToCheck = setDataset.toString();
		expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload.dataset).toEqual(data);
	});

	it("loads the dataset and config", () => {
		const dataset = [
          { uid: "uid1", role: { role: "role", confidence: 80 } },
          { uid: "uid2", role: { role: "role", confidence: 80 } }
        ];
        const configuration = {
          fields: [
            { path: ["uid"], displayName: "UID", groupable: true },
            { path: ["role", "role"], displayName: "Role", groupable: false }
          ]
        };

		const action$ = loadDataset({dataset, configuration});
		store.dispatch(action$);
		let typeToCheck = setDataset.toString();	

		expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload.dataset).toEqual(dataset);
		expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload.configuration).toEqual(configuration);
	});

});

describe("uploadDatasetEpic", () => {
	let store;

	beforeEach(() => {
		const epicMiddleware = createEpicMiddleware();
		const mockStore = configureMockStore([epicMiddleware]);
		store  = mockStore();
		epicMiddleware.run(rootEpic);
	});

	afterEach(() => {
		
	});

	it("uploads a file containing a dataset", () => {
		const data = [
		  { uid: "uid1", role: { role: "role", confidence: 80 } },
		  { uid: "uid2", role: { role: "role", confidence: 80 } }
		];
		const theBlob = new Blob([JSON.stringify(data)], { 'type': 'application/json' });

		const action$ = uploadDataset(theBlob);
		store.dispatch(action$);
		let typeToCheck = uploadDataset.toString();

		expect(store.getActions().filter(a => a.type === typeToCheck)[0].payload).toEqual(theBlob);
	});
});

describe("searchDatasetEpic", () => {
	let store;
	const data = [
		  { uid: "uid1", role: { role: "role", confidence: 80 } },
		  { uid: "uid2", role: { role: "role", confidence: 80 } }
		];

	beforeEach(() => {

		store  = configureStore();
		const action$ = setDataset({'dataset': data});		
		store.dispatch(action$);
		const config = store.getState().dataset.configuration;
		const indexAction$ = buildIndex({'dataset': data, 'configuration': config });
		store.dispatch(indexAction$);
	});

	afterEach(() => {
		
	});

	it("search a dataset", () => {
		const query = 'uid1';
		const ds = store.getState().dataset.dataset;
		const index = store.getState().search.searchIndex;

		const action$ = searchDataset({'dataset': ds, 'queryString': query, 'searchIndex': index});
		store.dispatch(action$);

		expect(action$.payload.results[0]).toEqual(data[0]);
	});

	it("clears a search", () => {
		const query = 'uid1';
		
		const ds = store.getState().dataset.dataset;
		const index = store.getState().search.searchIndex;

		const action$ = searchDataset({'dataset': ds, 'queryString': query, 'searchIndex': index});
		store.dispatch(action$);

		expect(action$.payload.results[0]).toEqual(data[0]);

		const clear = '';
		const clearAction$ = searchDataset({'dataset': ds, 'queryString': clear, 'searchIndex': index});
		store.dispatch(clearAction$);

		expect(clearAction$.payload.results.length).toEqual(0);
	});
});

//use dependency injection to test this epic without having to hit a real URL
//so that we can get consisten test results regardless of connectivity
describe("fetchDatasetEpic", () => {
	const data = [
		  { uid: "uid1", role: { role: "role", confidence: 80 } },
		  { uid: "uid2", role: { role: "role", confidence: 80 } }
		];
	const mockResponse = data;
	const mockAjax = () => {
	  	return  Observable.of({ 'response': mockResponse });
	  }
	const dependencies = {
	  'ajax': mockAjax
	};

	let store;

	beforeEach(() => {
		const epicMiddleware = createEpicMiddleware();
		const mockStore = configureMockStore([epicMiddleware]);
		store  = mockStore();
		epicMiddleware.run(rootEpic, {'dependencies': dependencies});
	});

	afterEach(() => {
		
	});

	it("loads the dataset with default config", () => {
		const url = 'test.test'
		let typeToCheck = loadDataset.toString();

		const action$ = of({'type': fetchDataset.toString(), 'payload': url});
		store = null;
		fetchDatasetEpic(action$, store, mockAjax)
			.subscribe(actions => {
				expect(actions.length).toEqual(1);
				expect(actions[0].type).toEqual(typeToCheck);
				expect(actions[0].payload).toEqual(data);
			});
	});
});

describe("indexDatasetEpic", () => {
	let store;
	const dataset = [
		  { uid: "uid1", role: { role: "role", confidence: 80 } },
		  { uid: "uid2", role: { role: "role", confidence: 80 } }
		];
	const configuration = {
	      fields: [
	        { path: ["uid"], displayName: "UID", groupable: true },
	        { path: ["role", "role"], displayName: "Role", groupable: false }
	      ]
	    };

	beforeEach(() => {

		store  = configureStore();
		const action$ = setDataset({'dataset': dataset});		
		store.dispatch(action$);
	});

	afterEach(() => {
		
	});

	it("sets the search index", () => {

	    const action$ = buildIndex({ dataset, configuration });
	    store.dispatch(action$);

	    const expectedConfiguration = {
	      fields: [
	        { path: ["uid"], displayName: "UID", groupable: true },
	        { path: ["role", "role"], displayName: "Role", groupable: false }
	      ]
	    };
	    const idx = getSearchIndex(store.getState())
	    expect(idx.fields.length).toEqual(expectedConfiguration.fields.length);
	});

	it("sets the results of a search", () => {
        

        const resultSet = [
          { uid: "uid1", role: { role: "role", confidence: 80 } },
          { uid: "uid2", role: { role: "role", confidence: 80 } }
        ];
        const searchString = 'uid';

        const action$ = setSearchResults({
          queryString: searchString,
          results: resultSet
        });
        store.dispatch(action$);
        expect(getSearchResults(store.getState())).toEqual(resultSet);
      });
});
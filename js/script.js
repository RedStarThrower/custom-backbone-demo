console.log('hello world') //<= testing that our page is reflected in the browser

// store some global variables (also copied below)
var key = "11eaa2ee2ebb78f1cfb25971ad39c74d:6:60564213"
var baseURL = "http://api.nytimes.com/svc/search/v2/articlesearch.json?"
var headlineContainer = document.querySelector("#headlineContainer")

// ----- Model constructor ------
// Purpose: gets data, parses(filters) data

var Model = function(inputURL,inputKey) {
	this.baseURL = inputURL
	this.key = inputKey //<= your api key
	this.data = null // <= empty value that will be overwritten as each search query makes a new api request and a new bundle of data (usually an object or array) is received.

	this.parse = function(rawness) { // <= goes into the data to the level that we need (all the way to the array containing articles)
		var parsedData = rawness.response.docs
		return parsedData
	}

	this.fetch = function(query) { //<= creates a new url using a custom search query, passes it to .getJSON and handles the response once its received.
		var fullURL = this.baseURL + "api-key=" + this.key + "&q=" + query
		var promise = $.getJSON(fullURL)

		var handleResponse = function(rawData) {
			//console.log(rawData)
			this.data = this.parse(rawData) // <= invokes the parse method (created above) to select needed data, and turns it into the value for the Model's this.data;

			// NOTE: context of "this" is changed when we send the function out as a callback - need to bind to the Model before it works.
		}

		var boundHandleResponse = handleResponse.bind(this) // <= binds/fixes the meaning of "this" in handleResponse (defined above) to the current Model instance (the object to be created by this Model constructor; read this again if necessary)

		//boundHandleResponse is a function (.bind always returns a new, bound function!!!) returned by .bind in which "this" keyword is no longer flexible but refers permanently to the model instance invoking fetch. It's a mutation of handleResponse.

		promise.then(boundHandleResponse) //<= after data is received, it is sent to boundHandleResponse/handleResponse to be parsed and assigned into the data property on the model object.
	}	

}

// ----- The View -----
// Purpose: Displays data

var View = function(where,inputModel) { // <= the container and an instance of the model are both assigned into properties on the new View instance.

	this.container = where
	this.model = inputModel // <= links the model instance to the view instance; as a result, the view instance "knows" which model instance it's associated with.

	this.writeData = function(data) { // <= places the retrieved lead paragraph into the container
		this.container.innerHTML = data
	}

	this.listenForChange = function() { // <= waits until data is received and writes data to the container.
		if (this.model.data === null) {
			setTimeout(this.listenForChange.bind(this),1000) // <= sends bound version of listenForChange (see above for why we bind it) to be executed a second later.

			// While the data is still null, i.e. the reponse hasn't come back yet, we will continue checking evry second.
		}
		else { //<= run once the data has come back
			var oneHeadline = this.model.data[0].lead_paragraph // <= defines/selects lead paragraph for the first article in the array 
			this.writeData(oneHeadline) // <= writes to the headline container 
		}
	}
}

var key = "11eaa2ee2ebb78f1cfb25971ad39c74d:6:60564213"
var baseURL = "http://api.nytimes.com/svc/search/v2/articlesearch.json?"
var headlineContainer = document.querySelector("#headlineContainer")

var timesModel = new Model(baseURL,key) //<= creates a new instance of the Model using a new base url and your api key
timesModel.fetch('brazil') //<= interprets the search query and requests data

var timesView = new View(headlineContainer,timesModel) // <= creates a new instance of the View, assigns headlineContainer and timesModel into the view instance's container and model properties, respectively. 
timesView.listenForChange() //<= waits until data is received to display it

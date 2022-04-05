const createRequests = [];

/**
 * Store the request.
 *
 * @param {JSON} resetRequest Object json type
 */
function createRequest(newRequest) {
  createRequests.push(newRequest);
}

/**
 * Return the element based on id.
 *
 * @param {Array} array The array to find the element
 */
function getElemRequest(id) {
  for (var i = 0; i < createRequests.length; i++) {
    if (createRequests[i].id === id) {
      return createRequests[i];
    }
  }
}

/**
 * Delete request objectId stored on Mongo.
 *
 * @param {Number} id The document _ID from Mongo
 */
function deleteRequest(id) {
  return createRequests.splice(
    createRequests.findIndex(function (i) {
      return i.id === id;
    }), 1);
}

module.exports = {
  createRequest,
  getElemRequest,
  deleteRequest,
  createRequests,
};

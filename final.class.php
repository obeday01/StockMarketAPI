<?php 
class final_rest
{



/**
 * @api  /api/v1/setTemp/
 * @apiName setTemp
 * @apiDescription Add remote temperature measurement
 *
 * @apiParam {string} location
 * @apiParam {String} sensor
 * @apiParam {double} value
 *
 * @apiSuccess {Integer} status
 * @apiSuccess {string} message
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":0,
 *              "message": ""
 *     }
 *
 * @apiError Invalid data types
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 OK
 *     {
 *              "status":1,
 *              "message":"Error Message"
 *     }
 *
 */
        public static function setTemp ($location, $sensor, $value)

	{
		if (!is_numeric($value)) {
			$retData["status"]=1;
			$retData["message"]="'$value' is not numeric";
		}
		else {
			try {
				EXEC_SQL("insert into temperature (location, sensor, value, date) values (?,?,?,CURRENT_TIMESTAMP)",$location, $sensor, $value);
				$retData["status"]=0;
				$retData["message"]="insert of '$value' for location: '$location' and sensor '$sensor' accepted";
			}
			catch  (Exception $e) {
				$retData["status"]=1;
				$retData["message"]=$e->getMessage();
			}
		}

		return json_encode ($retData);
	}

	public static function setStock($stockTicker, $queryType, $jsonData)

	{
		if (!($queryType == "news" || $queryType ==  "details")) {
			$retData["status"] = 1;
			$retData["message"] = "Invalid query type. Allowed types are 'details' and 'news'.";
		} else {
			try {
				EXEC_SQL("INSERT INTO stock (stockTicker, queryType, jsonData, dateTime) VALUES (?, ?, ?, CURRENT_TIMESTAMP)", $stockTicker, $queryType, $jsonData);
				$retData["status"] = 0;
				$retData["message"] = "Insert successful for stock ticker: '$stockTicker' and query type: '$queryType'.";
			}
			catch (Exception $e) {
				$retData["status"] = 1;
				$retData["message"] = $e->getMessage();
			}
		}

		return json_encode($retData);
	}

	public static function getStock($date)

	{
		if (!preg_match("/^\d{4}-\d{2}-\d{2}$/", $date)) {
			$retData["status"] = 1;
			$retData["message"] = "Invalid date format. Please provide the date in the format YYYY-MM-DD.";
			return json_encode($retData);
		}
		try {
			$results = GET_SQL("SELECT * FROM stock WHERE dateTime LIKE ? ORDER BY dateTime", $date . "%");
			$retData["status"] = 0;
			$retData["message"] = "Data retrieved successfully";
			$retData["result"] = $results;
		} catch (Exception $e) {
			$retData["status"] = 1;
			$retData["message"] = $e->getMessage();
		}
		return json_encode($retData);
	}
}

<?php 

	if ($_POST) {
		file_put_contents('database.json', json_encode($_POST));
	}
	
	echo file_get_contents('database.json');

<?php

  //Define where the output will be saved
  $file = 'comments.txt';

  //Define your Timezone if not already explicitly defined in your php.ini
  date_default_timezone_set('Europe/London');

  //Store your variables in a string, separated by a tab (\t)
  $output = $input;

  file_put_contents($file, $output, FILE_APPEND | LOCK_EX);

?>
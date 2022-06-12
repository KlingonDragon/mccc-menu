<?php 
foreach (json_decode(file_get_contents('ftp://ftp.drivehq.com/Deaderpool/Version/Version.json'),true) as $sims4_version => $mc_version) {}
echo json_encode(Array(
    'sims' => $sims4_version,
    'mccc' => $mc_version
))
?>
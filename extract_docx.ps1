[Reflection.Assembly]::LoadWithPartialName("System.IO.Compression.FileSystem") | Out-Null
$zip = [System.IO.Compression.ZipFile]::OpenRead("C:\Users\GT2413\ghee-ecommerce\ghee-ecommerce-master-prompt.docx")
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xmlString = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

$xml = [xml]$xmlString
$nsMgr = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$nsMgr.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$paragraphs = $xml.SelectNodes("//w:p", $nsMgr)
$outText = @()
foreach ($p in $paragraphs) {
    $outText += $p.InnerText
}
$outText | Out-File "C:\Users\GT2413\ghee-ecommerce\prompt_content.txt" -Encoding utf8

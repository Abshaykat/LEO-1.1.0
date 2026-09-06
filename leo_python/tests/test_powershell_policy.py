from leo_python.security.powershell_policy import validate_powershell

def test_blocks_mutation_and_download():
    assert not validate_powershell("Remove-Item x")[0]
    assert not validate_powershell("Invoke-WebRequest https://example.com")[0]
    assert not validate_powershell("iex $x")[0]

def test_allows_read_only_output():
    assert validate_powershell("Get-ChildItem")[0]
    assert validate_powershell("Get-Content a.txt")[0]

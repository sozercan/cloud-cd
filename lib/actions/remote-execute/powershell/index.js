"use strict";
var child_process_1 = require("child_process");
var ExecuteRemotePowerShell = (function () {
    function ExecuteRemotePowerShell() {
        this.ps_child = null;
    }
    /**
     * @description
     *  run powerhsell script localy. the script will invoke a remote command using winrm.
     *  The remote VM must have winrm enbled https://github.com/Azure/azure-quickstart-templates/tree/master/201-vm-winrm-windows
     * @example
     *  run_powershell("52.178.176.53", "username", "Pa$$word1", path.join(__dirname, "dummy.ps1"), (output) {
     *     console.log(output);
     *  });
     */
    ExecuteRemotePowerShell.prototype.run_powershell = function (host, username, password, script, callback) {
        var escapedPassword = password.replace(/(\$)/g, '`$');
        var commands = "$hostName=\"" + host + "\";" +
            "$winrmPort=\"5986\";" +
            "$soptions = New-PSSessionOption -SkipRevocationCheck -SkipCACheck -SkipCNCheck;" +
            ("$secpasswd = ConvertTo-SecureString \"" + escapedPassword + "\" -AsPlainText -Force;") +
            ("$creds = New-Object System.Management.Automation.PSCredential (\"" + username + "\", $secpasswd);") +
            ("Invoke-Command -ComputerName $hostName -Port $winrmPort -Credential $creds -SessionOption $soptions -UseSSL -FilePath \"" + script + "\";") +
            '';
        this.ps_child = child_process_1.spawn("powershell", [commands]);
        var outputs = "";
        var errors = "";
        this.ps_child.stdout.on("data", function (output) {
            console.log("Powershell Data: " + output);
            outputs += '\n' + output;
        });
        this.ps_child.stderr.on("data", function (data) {
            console.log("Powershell Errors: " + data);
            errors += '\n' + ((new Error(data)).message);
        });
        this.ps_child.on("exit", function () {
            console.log("Powershell Script finished");
            if (errors) {
                return callback(new Error(errors), outputs);
            }
            return callback(null, outputs);
        });
        this.ps_child.stdin.end(); //end input          
    };
    return ExecuteRemotePowerShell;
}());
exports.ExecuteRemotePowerShell = ExecuteRemotePowerShell;
//# sourceMappingURL=index.js.map
import 'package:flutter/material.dart';
import 'dart:io';

class IPAddressScreen extends StatefulWidget {
  @override
  _IPAddressScreenState createState() => _IPAddressScreenState();
}

class _IPAddressScreenState extends State<IPAddressScreen> {
  String _ipAddress = "Press the button to get IP";

  Future<void> _getIPAddress() async {
    try {
      for (var interface in await NetworkInterface.list()) {
        if (interface.name.contains("ap") || interface.name.contains("wlan")) {
          for (var addr in interface.addresses) {
            if (addr.type == InternetAddressType.IPv4) {
              setState(() {
                _ipAddress = addr.address;
              });
              return;
            }
          }
        }
      }
      setState(() {
        _ipAddress = "No valid Hotspot IP found";
      });
    } catch (e) {
      setState(() {
        _ipAddress = "Failed to get IP: $e";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Get WiFi IPv4 Address")),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_ipAddress, style: TextStyle(fontSize: 18)),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: _getIPAddress,
              child: Text("Get IP Address"),
            ),
          ],
        ),
      ),
    );
  }
}

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
        for (var addr in interface.addresses) {
          if (addr.type == InternetAddressType.IPv4 && addr.address.startsWith("192.168.")) {
            setState(() {
              _ipAddress = addr.address;
            });
            return;
          }
        }
      }
      setState(() {
        _ipAddress = "No valid IP found";
      });
    } catch (e) {
      setState(() {
        _ipAddress = "Failed to get IP";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Get IPv4 Address")),
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

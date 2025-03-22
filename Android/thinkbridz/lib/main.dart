import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:thinkbridz/getStarted.dart';
import 'test.dart';

void main() {
  runApp(const MyApp());

  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: Colors.white,
    systemNavigationBarIconBrightness: Brightness.dark,
  ));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ThinkBridZ',
      debugShowCheckedModeBanner: false,
      home: GetStarted(),
    );
  }
}
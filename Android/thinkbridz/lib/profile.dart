import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class Profile extends StatefulWidget {
  final String name;
  final String email;

  const Profile({super.key, required this.name, required this.email});

  @override
  State<Profile> createState() => _ProfileState();
}

class _ProfileState extends State<Profile> {
  Map<String, dynamic>? userData;
  late String userId;
  late String role;
  static String? baseUrl = dotenv.env['BASE_URL'];

  @override
  void initState() {
    super.initState();
    loadUserData();
  }

  Future<void> loadUserData() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    userId = prefs.getString('id') ?? '';
    role = prefs.getString('role') ?? 'User';
    setState(() {
      userData = {
        'name': prefs.getString('name') ?? 'No Name',
        'email': prefs.getString('email') ?? 'No Email',
        'role': role,
      };
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Profile"),
        backgroundColor: Colors.transparent,
        elevation: 0,
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF9DCEFF), Color(0xFF92A3FD)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Container(
          padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Profile Picture with Gradient Border
              Container(
                padding: const EdgeInsets.all(5),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    colors: [Color(0xFF9DCEFF), Color(0xFF92A3FD)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: CircleAvatar(
                  radius: 80,
                  backgroundImage: userData?['name'] == 'Rashmin'
                    ? NetworkImage("https://raw.githubusercontent.com/SwayamTakkamore/ideaSpark/refs/heads/main/profile_image_3.jpg", scale: 1.0)
                    : userData?['name'] == 'Swayam Takkamore'
                    ? NetworkImage("https://raw.githubusercontent.com/SwayamTakkamore/ideaSpark/refs/heads/main/profile_image_4.jpg", scale: 1.0)
                    : NetworkImage("https://raw.githubusercontent.com/SwayamTakkamore/ideaSpark/refs/heads/main/profile_image_2.jpg", scale: 1.0)
                ),
              ),
              const SizedBox(height: 20),
              // Name
              Text(
                userData?['name'] ?? 'No Name',
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 10),
              // Email
              Text(
                widget.email,
                style: const TextStyle(
                  fontSize: 18,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 10),
              // Role Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF92A3FD).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'Role: ${userData?['role'] ?? 'User'}',
                  style: const TextStyle(
                    fontSize: 16,
                    color: Color(0xFF92A3FD),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              // About Me Section
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'About Me:',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      'I am a student with a keen interest in building innovative solutions. I love exploring new technologies and contributing to open-source projects.',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.black87,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
              SizedBox(height: 230),
              ElevatedButton(
                onPressed: logoutUser,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF92A3FD),
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                  elevation: 5,
                  shadowColor: const Color(0xFF92A3FD).withOpacity(0.5),
                ),
                child: const Text(
                  "Logout",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> logoutUser() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    final url = Uri.parse('$baseUrl/logout');

    try {
      final response = await http.post(url);

      if (response.statusCode == 200) {
        await prefs.clear(); // Clear stored user data
        if (!mounted) return;
        Navigator.pushReplacementNamed(context, '/login'); // Redirect to login screen
      } else {
        throw Exception("Logout failed: ${response.reasonPhrase}");
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text("Error: Unable to log out"),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}
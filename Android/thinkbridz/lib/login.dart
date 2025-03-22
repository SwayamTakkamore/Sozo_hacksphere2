import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
// import 'dashboard.dart';
// import 'profile.dart';

class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {

  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  bool isLoading = false;
  bool _isHidden = true;
  String baseUrl = '';

  @override
  void initState() {
    super.initState();
    _fetchIPAddress();
  }

  Future<void> _fetchIPAddress() async {
    try {
      for (var interface in await NetworkInterface.list()) {
        for (var addr in interface.addresses) {
          if (addr.type == InternetAddressType.IPv4 &&
              addr.address.startsWith("192.168.")) {
            setState(() {
              baseUrl = 'http://${addr.address}:5000';
            });
            return;
          }
        }
      }
      setState(() {
        baseUrl = "No valid IP found";
      });
    } catch (e) {
      setState(() {
        baseUrl = "Failed to get IP";
      });
    }
  }

  // static const String baseUrl = 'http://192.168.139.183:5000';

  Future<void> loginUser() async {
    if (!_formKey.currentState!.validate()) return;
    if (baseUrl.isEmpty || baseUrl.contains("No valid IP")) {
      showError("Could not fetch local IP. Please check your WiFi.");
      return;
    }
    print(baseUrl);

    setState(() => isLoading = true);

    try {
      final url = Uri.parse('$baseUrl/login');
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "email": emailController.text,
          "password": passwordController.text,
        }),
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        if (responseData['message'] == "Login successful") {
          await fetchUserDetails(emailController.text);
        } else {
          showError("Unexpected response: ${response.body}");
        }
      } else {
        showError("Login failed: ${response.reasonPhrase}");
      }
    } catch (e) {
      showError("Network Error: Unable to connect to server");
    }

    setState(() => isLoading = false);
  }

  Future<void> fetchUserDetails(String email) async {
    try {
      final userUrl = Uri.parse('$baseUrl/user?email=$email');
      final userResponse = await http.get(userUrl);

      if (userResponse.statusCode == 200) {
        final userData = jsonDecode(userResponse.body);
        SharedPreferences prefs = await SharedPreferences.getInstance();
        await prefs.setString('email', userData['email']);
        await prefs.setString('name', userData['name']);
        await prefs.setString('role', userData['role']);
        await prefs.setString('id', userData['_id']);

        if (!mounted) return;
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) =>  Dashboard(email: userData['email']), // Navigate to Dashboard
          ),
        );
      } else {
        showError("Failed to fetch user details");
      }
    } catch (e) {
      showError("Login Succeed but Error fetching user data");
    }
  }

  void showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        child: IntrinsicHeight(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight: MediaQuery.of(context).size.height - 50,
            ),
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  const SizedBox(height: 60),
                  const SizedBox(
                    child: Text(
                      "Hey there,",
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w400,
                        color: Colors.black,
                      ),
                    ),
                  ),
                  const SizedBox(
                    child: Padding(
                      padding: EdgeInsets.only(top: 5.0),
                      child: Text(
                        "Welcome Back!",
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          color: Colors.black,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(
                    child: Padding(
                      padding: const EdgeInsets.only(
                        left: 30,
                        right: 30,
                        top: 15,
                      ),
                      child: Container(
                        decoration: const BoxDecoration(
                          color: Color(0xFFF7F8F8),
                          borderRadius: BorderRadius.all(Radius.circular(15)),
                        ),
                        child: TextFormField(
                          controller: emailController,
                          keyboardType: TextInputType.emailAddress,
                          textAlignVertical: TextAlignVertical.center,
                          decoration: InputDecoration(
                            border: InputBorder.none,
                            hintText: "Email",
                            hintStyle: const TextStyle(
                              color: Color(0xFFADA4A5),
                              textBaseline: TextBaseline.alphabetic,
                              fontSize: 14,
                            ),
                            hintTextDirection: TextDirection.ltr,
                            prefixIcon: Padding(
                              padding: const EdgeInsets.all(15),
                              child: SvgPicture.asset(
                                "assets/feather/mail.svg",
                                color: Colors.grey,
                                width: 20,
                              ),
                            ),
                          ),
                          validator: (value) =>
                          (value == null || value.isEmpty) ? 'Enter email' : null,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(
                    child: Padding(
                      padding: const EdgeInsets.only(
                        left: 30,
                        right: 30,
                        top: 15,
                      ),
                      child: Container(
                        decoration: const BoxDecoration(
                          color: Color(0xFFF7F8F8),
                          borderRadius: BorderRadius.all(Radius.circular(15)),
                        ),
                        child: TextFormField(
                          controller: passwordController,
                          obscureText: _isHidden,
                          textAlignVertical: TextAlignVertical.center,
                          decoration: InputDecoration(
                            border: InputBorder.none,
                            hintText: "Password",
                            hintStyle: const TextStyle(
                              color: Color(0xFFADA4A5),
                              textBaseline: TextBaseline.alphabetic,
                              fontSize: 14,
                            ),
                            hintTextDirection: TextDirection.ltr,
                            prefixIcon: Padding(
                              padding: const EdgeInsets.all(15),
                              child: SvgPicture.asset(
                                "assets/feather/lock.svg",
                                color: Colors.grey,
                                width: 20,
                              ),
                            ),
                            suffixIcon: Padding(
                              padding: const EdgeInsets.only(),
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  foregroundColor: Colors.transparent,
                                  backgroundColor: Colors.transparent,
                                  overlayColor: Colors.transparent,
                                  padding: const EdgeInsets.only(left: 0),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                  minimumSize: const Size(50, 50),
                                  elevation: 0,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _isHidden = !_isHidden;
                                  });
                                },
                                child: SvgPicture.asset(
                                  _isHidden
                                      ? "assets/feather/eye.svg"
                                      : "assets/feather/eye-off.svg",
                                  color: Colors.grey,
                                  width: 20,
                                ),
                              ),
                            ),
                          ),
                          validator: (value) =>
                          (value == null || value.isEmpty) ? 'Enter password' : null,
                        ),
                      ),
                    ),
                  ),
                  const Spacer(),
                  SizedBox(
                    child: Container(
                      decoration: BoxDecoration(
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF95ADFE).withOpacity(0.3),
                            blurRadius: 10,
                            offset: const Offset(0, 5),
                          ),
                        ],
                        borderRadius: const BorderRadius.all(
                          Radius.circular(30),
                        ),
                        gradient: const LinearGradient(
                          colors: [Color(0xFF9DCEFF), Color(0xFF92A3FD)],
                        ),
                      ),
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          minimumSize: const Size(320, 55),
                          elevation: 0,
                        ),
                        onPressed: isLoading ? null : loginUser,
                        child: isLoading
                            ? const CircularProgressIndicator(
                          color: Colors.white,
                        )
                            : const Text(
                          "Login",
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        "Don't have an account yet?",
                        style: TextStyle(color: Colors.black, fontSize: 14),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.pop(context);
                        },
                        style: TextButton.styleFrom(
                          overlayColor: Colors.transparent,
                        ),
                        child: ShaderMask(
                          shaderCallback: (Rect bounds) {
                            return const LinearGradient(
                              colors: <Color>[
                                Color(0xFFC58BF2),
                                Color(0xFFEEA4CE),
                              ],
                            ).createShader(bounds);
                          },
                          child: const Text(
                            "Register",
                            style: TextStyle(
                              color: Color(0xFFC900FF),
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class Dashboard extends StatelessWidget {
  const Dashboard({super.key, required email});

  @override
  Widget build(BuildContext context) {
    return const Placeholder();
  }
}

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'login.dart';
import 'package:http/http.dart' as http;

class Signup extends StatefulWidget {
  const Signup({super.key});

  @override
  State<Signup> createState() => _SignupState();
}

class _SignupState extends State<Signup> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  String _selectedRole = "student";
  final TextEditingController _expertiseController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  bool _isHidden = false;
  bool _isAccepted = false;
  bool _showWarning = false;

  Future<void> _registerUser() async {
    // Check if the form is valid
    if (!_formKey.currentState!.validate()) return;

    // Prepare data for registration
    final String name = _nameController.text;
    final String email = _emailController.text;
    final String password = _passwordController.text;
    final List<String> expertise = _expertiseController.text.split(',');

    try {
      final response = await http.post(
        Uri.parse('http://192.168.182.199:5000/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
          'role': _selectedRole,
          'expertise': expertise,
        }),
      );

      final responseData = jsonDecode(response.body);
      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Registration successful!")),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(responseData['error'] ?? 'Registration failed')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("An error occurred. Please try again.")),
      );
    }
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
              key: _formKey, // Associate the Form with _formKey
              child: Column(
                children: [
                  const SizedBox(height: 60),
                  const Text(
                    "Hey there,",
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w400,
                      color: Colors.black,
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.only(top: 5.0),
                    child: Text(
                      "Create an Account",
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: Colors.black,
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 30, right: 30, top: 30),
                    child: Container(
                      decoration: const BoxDecoration(
                        color: Color(0xFFF7F8F8),
                        borderRadius: BorderRadius.all(Radius.circular(15)),
                      ),
                      child: TextFormField(
                        controller: _nameController,
                        validator: (value) => value!.isEmpty ? 'Enter your name' : null,
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          hintText: "Name",
                          hintStyle: const TextStyle(
                            color: Color(0xFFADA4A5),
                            fontSize: 14,
                          ),
                          contentPadding: const EdgeInsets.all(15),
                          prefixIcon: Padding(
                            padding: const EdgeInsets.all(15),
                            child: SvgPicture.asset(
                              "assets/feather/user.svg",
                              color: Colors.grey,
                              width: 20,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 30, right: 30, top: 15),
                    child: Container(
                      decoration: const BoxDecoration(
                        color: Color(0xFFF7F8F8),
                        borderRadius: BorderRadius.all(Radius.circular(15)),
                      ),
                      child: TextFormField(
                        controller: _emailController,
                        validator: (value) => value!.isEmpty ? 'Enter a valid email' : null,
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          hintText: "Email",
                          hintStyle: const TextStyle(
                            color: Color(0xFFADA4A5),
                            fontSize: 14,
                          ),
                          contentPadding: const EdgeInsets.all(15),
                          prefixIcon: Padding(
                            padding: const EdgeInsets.all(15),
                            child: SvgPicture.asset(
                              "assets/feather/user.svg",
                              color: Colors.grey,
                              width: 20,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 30, right: 30, top: 15),
                    child: Container(
                      decoration: const BoxDecoration(
                        color: Color(0xFFF7F8F8),
                        borderRadius: BorderRadius.all(Radius.circular(15)),
                      ),
                      child: TextFormField(
                        obscureText: !_isHidden,
                        controller: _passwordController,
                        validator: (value) => value!.length < 6 ? 'Password must be at least 6 characters' : null,
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          hintText: "Password",
                          hintStyle: const TextStyle(
                            color: Color(0xFFADA4A5),
                            fontSize: 14,
                          ),
                          contentPadding: const EdgeInsets.all(15),
                          prefixIcon: Padding(
                            padding: const EdgeInsets.all(15),
                            child: SvgPicture.asset(
                              "assets/feather/lock.svg",
                              color: Colors.grey,
                              width: 20,
                            ),
                          ),
                          suffixIcon: IconButton(
                            icon: SvgPicture.asset(
                              _isHidden ? "assets/feather/eye.svg" : "assets/feather/eye-off.svg",
                              color: Colors.grey,
                              width: 20,
                            ),
                            onPressed: () {
                              setState(() {
                                _isHidden = !_isHidden;
                              });
                            },
                          ),
                        ),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 30, right: 30, top: 15),
                    child: Container(
                      decoration: const BoxDecoration(
                        color: Color(0xFFF7F8F8),
                        borderRadius: BorderRadius.all(Radius.circular(15)),
                      ),
                      child: DropdownButtonFormField(
                        value: _selectedRole,
                        items: [
                          DropdownMenuItem(
                            alignment: Alignment.bottomLeft,
                            value: "student",
                            child: Text(
                              "Student",
                              style: TextStyle(
                                color: Color(0xFFADA4A5),
                                fontSize: 14,
                              ),
                            ),
                          ),
                          DropdownMenuItem(
                            alignment: Alignment.bottomLeft,
                            value: "mentor",
                            child: Text(
                              "Mentor",
                              style: TextStyle(
                                color: Color(0xFFADA4A5),
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ],
                        onChanged: (value) {
                          setState(() {
                            _selectedRole = value.toString();
                          });
                        },
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          prefixIcon: Padding(
                            padding: const EdgeInsets.all(15),
                            child: SvgPicture.asset(
                              "assets/feather/user.svg",
                              color: Colors.grey,
                              width: 20,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 30, right: 30, top: 15),
                    child: Container(
                      decoration: const BoxDecoration(
                        color: Color(0xFFF7F8F8),
                        borderRadius: BorderRadius.all(Radius.circular(15)),
                      ),
                      child: TextFormField(
                        controller: _expertiseController,
                        validator: (value) => _selectedRole == 'mentor' && value!.isEmpty ? 'Enter expertise' : null,
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.all(15),
                          hintText: "Expertise (comma separated)",
                          hintStyle: const TextStyle(
                            color: Color(0xFFADA4A5),
                            fontSize: 14,
                          ),
                          prefixIcon: Padding(
                            padding: const EdgeInsets.all(15),
                            child: SvgPicture.asset(
                              "assets/feather/user.svg",
                              color: Colors.grey,
                              width: 20,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(top: 5, right: 10),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Checkbox(
                          value: _isAccepted,
                          onChanged: (bool? value) {
                            setState(() {
                              _isAccepted = value!;
                              _showWarning = false;
                            });
                          },
                          activeColor: Colors.blueAccent,
                        ),
                        const Text(
                          "By continuing you accept our Privacy Policy and \nTerm of Use",
                          style: TextStyle(
                            color: Colors.black,
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Visibility(
                    visible: _showWarning,
                    child: Container(
                      color: Colors.white,
                      child: const Text(
                        "Please accept the terms and conditions",
                        style: TextStyle(
                          color: Colors.red,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                  const Spacer(),
                  Container(
                    decoration: BoxDecoration(
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF95ADFE).withOpacity(0.3),
                          blurRadius: 10,
                          offset: const Offset(0, 5),
                        ),
                      ],
                      borderRadius: const BorderRadius.all(Radius.circular(30)),
                      gradient: const LinearGradient(
                        colors: [
                          Color(0xFF9DCEFF),
                          Color(0xFF92A3FD),
                        ],
                      ),
                    ),
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        minimumSize: const Size(320, 55),
                        elevation: 0,
                      ),
                      onPressed: () {
                        if (!_isAccepted) {
                          setState(() {
                            _showWarning = true;
                          });
                        } else {
                          setState(() {
                            _showWarning = false;
                          });
                          _registerUser();
                        }
                      },
                      child: const Text(
                        "Register",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        "Already have an account?",
                        style: TextStyle(
                          color: Colors.black,
                          fontSize: 14,
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const Login(),
                            ),
                          );
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
                            "Login",
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
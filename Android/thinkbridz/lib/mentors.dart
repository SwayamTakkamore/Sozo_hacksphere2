import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class GetMentors extends StatefulWidget {
  final String email;

  const GetMentors({super.key, required this.email});

  @override
  State<GetMentors> createState() => _GetMentorsState();
}

class _GetMentorsState extends State<GetMentors> {
  List<dynamic> _ideas = [];
  List<dynamic> _mentors = [];
  bool _isLoading = true;
  bool _isFetchingMentors = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchIdeas();
  }

  Future<void> _fetchIdeas() async {
    try {
      final url = Uri.parse('http://192.168.182.199:5000/idea?email=${widget.email}');
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is List) {
          setState(() {
            _ideas = data;
            _isLoading = false;
          });
        } else {
          setState(() => _error = 'Unexpected response format');
        }
      } else {
        setState(() => _error = 'Error: ${response.reasonPhrase}');
      }
    } catch (e) {
      setState(() => _error = 'Network Error: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchMentors() async {
    try {
      final url = Uri.parse('http://192.168.182.199:5000/mentors');
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        if (data is List) { // ✅ Handle List response
          setState(() {
            _mentors = List<Map<String, dynamic>>.from(data);
            _isLoading = false;
          });
        } else {
          setState(() {
            _error = 'Unexpected response format';
            _isLoading = false;
          });
        }
      } else {
        setState(() {
          _error = 'Failed to fetch mentors: ${response.reasonPhrase}';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Network Error: $e';
        _isLoading = false;
      });
    }
  }




  void _showMentorSelectionDialog(String ideaId) {
    if (_mentors.isEmpty) {
      _fetchMentors();
    }

    showModalBottomSheet(
      context: context,
      builder: (context) {
        return _isFetchingMentors
            ? const Center(child: CircularProgressIndicator())
            : _mentors.isEmpty
            ? const Center(child: Text('No mentors available'))
            : ListView.builder(
          itemCount: _mentors.length,
          itemBuilder: (context, index) {
            final mentor = _mentors[index];

            return ListTile(
              title: Text(mentor['name'] ?? 'No Name'),
              subtitle: Text(mentor['expertise'] != null && mentor['expertise'].isNotEmpty
                  ? mentor['expertise'].join(', ') // ✅ Convert List<String> to a single String
                  : 'No expertise listed'),
            );
          },
        );
      },
    );
  }

  Future<void> _pitchIdeaToMentor(String ideaId, String mentorId) async {
    try {
      final url = Uri.parse('http://192.168.182.199:5000/pitch');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'ideaId': ideaId, 'mentorId': mentorId}),
      );

      if (response.statusCode == 200) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Idea pitched successfully!')),
        );
      } else {
        throw Exception('Failed to pitch idea');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error pitching idea: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Your Submitted Ideas'),
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
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(child: Text(_error!))
          : _ideas.isEmpty
          ? const Center(child: Text('No ideas submitted yet.'))
          : ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _ideas.length,
        itemBuilder: (context, index) {
          final idea = _ideas[index];
          bool isVerified = idea['status'] == 'verified';

          return Card(
            elevation: 5,
            margin: const EdgeInsets.only(bottom: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(15),
            ),
            child: InkWell(
              onTap: () {
                if (isVerified) {
                  _fetchMentors();
                  _showMentorSelectionDialog(idea['_id']);
                }
              },
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment:
                      MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          idea['title'] ?? 'No Title',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        IconButton(
                          icon: Icon(
                            isVerified
                                ? Icons.check_circle
                                : Icons.cancel,
                            color: isVerified
                                ? Colors.green
                                : Colors.red,
                          ),
                          onPressed: () {
                            if (isVerified) {
                              _fetchMentors();
                              _showMentorSelectionDialog(
                                  idea['_id']);
                            }
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      idea['description'] ?? 'No Description',
                      style: const TextStyle(
                        fontSize: 14,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Domain: ${idea['domain'] ?? 'N/A'}',
                      style: const TextStyle(
                        fontSize: 14,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Subdomain: ${idea['subDomain'] ?? 'N/A'}',
                      style: const TextStyle(
                        fontSize: 14,
                        color: Colors.black87,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

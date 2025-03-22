import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:file_picker/file_picker.dart';

class IdeaSubmissionPage extends StatefulWidget {
  final String email; // Add email parameter

  const IdeaSubmissionPage({super.key, required this.email});

  @override
  State<IdeaSubmissionPage> createState() => _IdeaSubmissionPageState();
}

class _IdeaSubmissionPageState extends State<IdeaSubmissionPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _tagsController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _uidController = TextEditingController();
  String? _pdfPath;
  bool _isLoading = false;

  // Dropdown values
  String? _selectedDomain;
  String? _selectedSubdomain;

  // Domain and Subdomain options
  final Map<String, List<String>> _domainOptions = {
    'Technology': ['AI', 'Web Development', 'Mobile Development', 'Data Science'],
    'Business': ['Marketing', 'Finance', 'Entrepreneurship'],
    'Design': ['UI/UX', 'Graphic Design', 'Animation'],
  };

  Future<void> _submitIdea() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final url = Uri.parse('http://192.168.139.199:5000/ideas');
      final request = http.MultipartRequest('POST', url);

      // Add text fields
      request.fields['title'] = _titleController.text;
      request.fields['domain'] = _selectedDomain ?? '';
      request.fields['subDomain'] = _selectedSubdomain ?? '';
      request.fields['tags'] = _tagsController.text;
      request.fields['description'] = _descriptionController.text;
      request.fields['uid'] = _uidController.text;
      request.fields['email'] = widget.email; // Use the email from the Login Page

      // Add PDF file
      if (_pdfPath != null) {
        request.files.add(await http.MultipartFile.fromPath('pdf', _pdfPath!));
      }

      final response = await request.send();
      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Idea submitted successfully!')),
        );
        _clearForm();
      } else {
        throw Exception('Failed to submit idea: ${response.reasonPhrase}');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _pickPDF() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );

    if (result != null) {
      setState(() {
        _pdfPath = result.files.single.path;
      });
    }
  }

  void _clearForm() {
    _titleController.clear();
    _tagsController.clear();
    _descriptionController.clear();
    _uidController.clear();
    setState(() {
      _pdfPath = null;
      _selectedDomain = null;
      _selectedSubdomain = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Submit Your Idea'),
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
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title
              _buildTextField('Title', _titleController, 'Enter your idea title'),
              const SizedBox(height: 20),
              // Domain Dropdown
              _buildDropdown(
                label: 'Domain',
                value: _selectedDomain,
                items: _domainOptions.keys.toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedDomain = value;
                    _selectedSubdomain = null; // Reset subdomain when domain changes
                  });
                },
              ),
              const SizedBox(height: 20),
              // Subdomain Dropdown
              _buildDropdown(
                label: 'Subdomain',
                value: _selectedSubdomain,
                items: _selectedDomain != null
                    ? _domainOptions[_selectedDomain]!
                    : [],
                onChanged: (value) {
                  setState(() {
                    _selectedSubdomain = value;
                  });
                },
              ),
              const SizedBox(height: 20),
              // Tags
              _buildTextField('Tags', _tagsController, 'Enter tags (comma-separated)'),
              const SizedBox(height: 20),
              // Project Description
              Text(
                'Project Description',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[800],
                ),
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _descriptionController,
                maxLines: 5,
                decoration: InputDecoration(
                  hintText: 'Describe your project in detail',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                validator: (value) =>
                value!.isEmpty ? 'Project description is required' : null,
              ),
              const SizedBox(height: 20),
              // Attach PDF
              Text(
                'Attach PDF (Optional)',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[800],
                ),
              ),
              const SizedBox(height: 10),
              ElevatedButton(
                onPressed: _pickPDF,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: BorderSide(color: Colors.grey[300]!),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.attach_file, color: Colors.grey[800]),
                    const SizedBox(width: 10),
                    Text(
                      _pdfPath != null ? 'PDF Attached' : 'Choose PDF',
                      style: TextStyle(color: Colors.grey[800]),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),
              // Submit Button
              Center(
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submitIdea,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF92A3FD),
                    padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                    elevation: 5,
                    shadowColor: const Color(0xFF92A3FD).withOpacity(0.5),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text(
                    'Submit Idea',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, String hint) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.grey[800],
          ),
        ),
        const SizedBox(height: 10),
        TextFormField(
          controller: controller,
          decoration: InputDecoration(
            hintText: hint,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          validator: (value) => value!.isEmpty ? '$label is required' : null,
        ),
      ],
    );
  }

  Widget _buildDropdown({
    required String label,
    required String? value,
    required List<String> items,
    required Function(String?) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.grey[800],
          ),
        ),
        const SizedBox(height: 10),
        DropdownButtonFormField<String>(
          value: value,
          items: items.map((String item) {
            return DropdownMenuItem<String>(
              value: item,
              child: Text(item),
            );
          }).toList(),
          onChanged: onChanged,
          decoration: InputDecoration(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          validator: (value) => value == null ? 'Please select a $label' : null,
        ),
      ],
    );
  }
}
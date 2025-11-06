#!/usr/bin/env python3
"""
Parse test-results/test_results.log to extract actual test failures (not warnings)
Categorize by test type and create structured error inventory
"""

import re
import json
from collections import defaultdict
from datetime import datetime

def parse_test_results_log(log_file_path):
    """Parse test results log and extract failures"""
    
    # Data structures
    test_failures = []
    test_passes = []
    current_test_file = None
    current_test_name = None
    current_error = None
    in_error_stack = False
    error_lines = []
    
    # Categorization counters
    categories = {
        'unit': [],
        'system': [],
        'integration': [],
        'ui': [],
        'utils': []
    }
    
    # Error type counters
    error_types = defaultdict(int)
    
    # Statistics
    stats = {
        'total_lines': 0,
        'console_warnings': 0,
        'act_warnings': 0,
        'actual_failures': 0,
        'test_suites_failed': 0,
        'test_suites_passed': 0,
        'tests_failed': 0,
        'tests_passed': 0
    }
    
    print(f"Parsing {log_file_path}...")
    
    with open(log_file_path, 'r', errors='ignore') as f:
        for line_num, line in enumerate(f, 1):
            stats['total_lines'] += 1
            
            # Skip console warnings/errors that are not actual test failures
            if 'console.error' in line or 'console.warn' in line:
                stats['console_warnings'] += 1
                continue
            
            # Skip React act() warnings (these are not actual failures)
            if 'Warning: An update to' in line and 'not wrapped in act(...)' in line:
                stats['act_warnings'] += 1
                continue
            
            # Detect test file
            test_file_match = re.search(r'(tests/(?:unit|system|integration|ui|utils)/[^\s]+\.(?:test|spec)\.(?:js|jsx|ts|tsx|cjs))', line)
            if test_file_match:
                current_test_file = test_file_match.group(1)
            
            # Detect test name patterns
            test_name_match = re.search(r'●\s+(.+?)(?:\s+›\s+(.+))?$', line.strip())
            if test_name_match:
                current_test_name = test_name_match.group(1)
                if test_name_match.group(2):
                    current_test_name += ' › ' + test_name_match.group(2)
            
            # Detect actual test failures (not warnings)
            failure_patterns = [
                r'FAIL\s+tests/',
                r'✕\s+',
                r'×\s+',
                r'Error:',
                r'AssertionError:',
                r'TypeError:',
                r'ReferenceError:',
                r'SyntaxError:',
                r'RangeError:',
                r'Expected:',
                r'Received:',
                r'expect\(',
                r'thrown:',
                r'test.*failed',
            ]
            
            is_failure = any(re.search(pattern, line, re.I) for pattern in failure_patterns)
            
            if is_failure and 'console.error' not in line and 'Warning:' not in line:
                if not in_error_stack:
                    # Start of new error
                    in_error_stack = True
                    error_lines = [line.strip()]
                    
                    # Try to extract error type
                    error_type_match = re.search(r'((?:Assertion|Type|Reference|Syntax|Range)Error):', line)
                    if error_type_match:
                        error_type = error_type_match.group(1)
                        error_types[error_type] += 1
                else:
                    error_lines.append(line.strip())
            elif in_error_stack:
                # Check if we're still in the error stack
                if line.strip() and (line.strip().startswith('at ') or 
                                    line.strip().startswith('Expected') or 
                                    line.strip().startswith('Received') or
                                    re.search(r'^\s*\d+\s*\|', line)):
                    error_lines.append(line.strip())
                else:
                    # End of error stack - save it
                    if current_test_file and error_lines:
                        error_entry = {
                            'test_file': current_test_file,
                            'test_name': current_test_name or 'Unknown',
                            'error_message': error_lines[0] if error_lines else 'Unknown error',
                            'stack_trace': error_lines[:20],  # Limit stack trace
                            'line_number': line_num
                        }
                        
                        # Categorize by test type
                        if '/unit/' in current_test_file:
                            categories['unit'].append(error_entry)
                        elif '/system/' in current_test_file:
                            categories['system'].append(error_entry)
                        elif '/integration/' in current_test_file:
                            categories['integration'].append(error_entry)
                        elif '/ui/' in current_test_file:
                            categories['ui'].append(error_entry)
                        elif '/utils/' in current_test_file:
                            categories['utils'].append(error_entry)
                        
                        test_failures.append(error_entry)
                        stats['actual_failures'] += 1
                    
                    in_error_stack = False
                    error_lines = []
            
            # Detect test suite summary
            if re.search(r'Test Suites:.*failed', line, re.I):
                match = re.search(r'(\d+)\s+failed', line)
                if match:
                    stats['test_suites_failed'] = int(match.group(1))
                match = re.search(r'(\d+)\s+passed', line)
                if match:
                    stats['test_suites_passed'] = int(match.group(1))
            
            if re.search(r'Tests:.*failed', line, re.I):
                match = re.search(r'(\d+)\s+failed', line)
                if match:
                    stats['tests_failed'] = int(match.group(1))
                match = re.search(r'(\d+)\s+passed', line)
                if match:
                    stats['tests_passed'] = int(match.group(1))
    
    return {
        'stats': stats,
        'categories': categories,
        'error_types': dict(error_types),
        'test_failures': test_failures,
        'timestamp': datetime.now().isoformat()
    }

def generate_report(results, output_file):
    """Generate structured error inventory report"""
    
    print(f"\n{'='*80}")
    print("TEST RESULTS LOG ANALYSIS")
    print(f"{'='*80}\n")
    
    # Statistics
    print("STATISTICS:")
    print(f"  Total log lines: {results['stats']['total_lines']:,}")
    print(f"  Console warnings (filtered): {results['stats']['console_warnings']:,}")
    print(f"  React act() warnings (filtered): {results['stats']['act_warnings']:,}")
    print(f"  Actual test failures found: {results['stats']['actual_failures']}")
    print(f"  Test suites failed: {results['stats']['test_suites_failed']}")
    print(f"  Test suites passed: {results['stats']['test_suites_passed']}")
    print(f"  Tests failed: {results['stats']['tests_failed']}")
    print(f"  Tests passed: {results['stats']['tests_passed']}")
    
    # Error types
    print(f"\nERROR TYPES:")
    for error_type, count in sorted(results['error_types'].items(), key=lambda x: x[1], reverse=True):
        print(f"  {error_type}: {count}")
    
    # Categorization
    print(f"\nERRORS BY CATEGORY:")
    for category, errors in results['categories'].items():
        if errors:
            print(f"  {category.upper()}: {len(errors)} errors")
            unique_files = set(e['test_file'] for e in errors)
            print(f"    Affected files: {len(unique_files)}")
            for test_file in sorted(unique_files)[:5]:  # Show first 5
                count = sum(1 for e in errors if e['test_file'] == test_file)
                print(f"      - {test_file}: {count} error(s)")
            if len(unique_files) > 5:
                print(f"      ... and {len(unique_files) - 5} more files")
    
    # Generate detailed report
    print(f"\nGenerating detailed report: {output_file}")
    with open(output_file, 'w') as f:
        f.write("# Test Results Error Inventory\n\n")
        f.write(f"Generated: {results['timestamp']}\n\n")
        
        f.write("## Summary\n\n")
        f.write(f"- **Total actual failures**: {results['stats']['actual_failures']}\n")
        f.write(f"- **Console warnings (filtered)**: {results['stats']['console_warnings']:,}\n")
        f.write(f"- **React act() warnings (filtered)**: {results['stats']['act_warnings']:,}\n")
        f.write(f"- **Test suites failed**: {results['stats']['test_suites_failed']}\n")
        f.write(f"- **Tests failed**: {results['stats']['tests_failed']}\n\n")
        
        f.write("## Error Types\n\n")
        for error_type, count in sorted(results['error_types'].items(), key=lambda x: x[1], reverse=True):
            f.write(f"- **{error_type}**: {count}\n")
        f.write("\n")
        
        # Detailed errors by category
        for category in ['unit', 'system', 'integration', 'ui', 'utils']:
            errors = results['categories'][category]
            if errors:
                f.write(f"## {category.upper()} Test Errors ({len(errors)})\n\n")
                
                # Group by file
                by_file = defaultdict(list)
                for error in errors:
                    by_file[error['test_file']].append(error)
                
                for test_file, file_errors in sorted(by_file.items()):
                    f.write(f"### {test_file} ({len(file_errors)} error(s))\n\n")
                    
                    for i, error in enumerate(file_errors[:3], 1):  # Show first 3 per file
                        f.write(f"#### Error {i}: {error['test_name']}\n\n")
                        f.write("**Error Message:**\n```\n")
                        f.write(error['error_message'] + "\n")
                        f.write("```\n\n")
                        
                        if error['stack_trace'] and len(error['stack_trace']) > 1:
                            f.write("**Stack Trace (first 5 lines):**\n```\n")
                            for line in error['stack_trace'][1:6]:
                                f.write(line + "\n")
                            f.write("```\n\n")
                    
                    if len(file_errors) > 3:
                        f.write(f"*... and {len(file_errors) - 3} more errors in this file*\n\n")
    
    # Generate JSON for programmatic access
    json_file = output_file.replace('.md', '.json')
    with open(json_file, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"JSON data saved: {json_file}")
    
    print(f"\n{'='*80}")
    print("ANALYSIS COMPLETE")
    print(f"{'='*80}\n")

if __name__ == '__main__':
    log_file = '/Users/Shared/cursor/jjyotish-shastra/test-results/test_results.log'
    output_file = '/Users/Shared/cursor/jjyotish-shastra/test-results/error-inventory.md'
    
    results = parse_test_results_log(log_file)
    generate_report(results, output_file)
    
    print(f"\nNext steps:")
    print(f"  1. Review the error inventory: {output_file}")
    print(f"  2. Prioritize errors by category (Unit → System → Integration → UI → Utils)")
    print(f"  3. Map errors to user data flows")
    print(f"  4. Apply production-grade fixes")


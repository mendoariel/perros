import re

input_file = 'recovered_backup_20260121.sql'
output_file = 'sanitized_backup_v2.sql'

with open(input_file, 'r', encoding='utf-8') as f_in, open(output_file, 'w', encoding='utf-8') as f_out:
    enum_mode = False
    enum_buffer = []
    
    for line in f_in:
        # Handle Enum Definition for MedalState
        if 'CREATE TYPE public."MedalState" AS ENUM (' in line:
            enum_mode = True
            f_out.write(line)
            continue
        
        if enum_mode:
            if ');' in line:
                enum_mode = False
                # Process buffer
                cleaned_buffer = []
                for enum_line in enum_buffer:
                    if "'REGISTERED'" in enum_line or "'PENDING_CONFIRMATION'" in enum_line:
                        continue
                    cleaned_buffer.append(enum_line)
                
                # Fix trailing comma on last item
                if cleaned_buffer:
                    for i in range(len(cleaned_buffer) - 1):
                         f_out.write(cleaned_buffer[i])
                    # Last item: remove trailing comma if present, but keep newline
                    last_item = cleaned_buffer[-1]
                    # We strip the newline, then the comma, then add newline back
                    last_item = last_item.strip().rstrip(',') + '\n'
                    f_out.write(last_item)
                
                f_out.write(line)
                enum_buffer = []
                continue
            
            # Add to buffer
            enum_buffer.append(line)
            continue

        # Handle Data Replacement
        # We can safely do global replacement on non-enum lines if we are careful, 
        # but focused replacement is better.
        # However, for simplicity and since we handled the definition above,
        # we can just replace 'REGISTERED' -> 'ENABLED' and 'PENDING_CONFIRMATION' -> 'INCOMPLETE'
        # in the data sections. 
        # Since the keywords are unique enough in this context (UPPERCASE specific status),
        # validation: 'REGISTERED' is likely only used as the status.
        
        # We perform the data mapping
        new_line = line.replace('REGISTERED', 'ENABLED')
        new_line = new_line.replace('PENDING_CONFIRMATION', 'INCOMPLETE')
        
        f_out.write(new_line)

print("Backup sanitization complete.")

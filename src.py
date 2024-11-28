import os

path = './src'


def rename_folder(path):
    edited = []

    for file in os.listdir(path):
        filePath = os.path.join(path, file)
        
        if len(file) > 3 and file[-3:] == '.js':
            new_path = filePath + 'x'
            print(f" Renaming { filePath } to { new_path }... ")

            os.rename(filePath, new_path)

            edited.append({
                "src": filePath,
                "dst": new_path
            })
        
        elif os.path.isdir(filePath):
            print(f"\nGoing into {filePath} ...")
            edited.extend(rename_folder(filePath))

    return edited


def unname_files(log):

    for item in log:
        print(f" Renaming { item['dst'] } to { item['src'] } ")

        os.rename(item['dst'], item['src'])




edited_files = rename_folder(path)

reverse = input("Reverse these changes (Y/N)? ").lower()

while reverse not in ['y', 'n']:
    reverse = input("Reverse these changes (Y/N)? ")

if reverse == 'y':
    unname_files(edited_files)
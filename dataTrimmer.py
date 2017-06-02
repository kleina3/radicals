#this file reads kradfileFull and turns it into a new file

#used to condense the very large dictionary file linked below
#http://nihongo.monash.edu/kanjidic2/kanjidic2.xml.gz
#to just kanji and grade level
def trimDict():
    with open("kanjidic2.xml", "r") as kData:
        with open("kanjitrim.txt", "w+") as newFile:
            checkGrade = False
            for line in kData:
                if "<literal>" in line:
                    if (checkGrade):
                        newFile.write(" 11\n")
                    newFile.write(line[9])
                    checkGrade = True
                if "<grade>" in line:
                    if (line[8] == '0'):
                        newFile.write(" 10\n")
                    else:
                        newFile.write(" " + line[7] + "\n")
                    checkGrade = False

def trim(grade):
    with open("kanjitrim.txt", "r") as kData:
        with open("kradfileFull", "r", encoding="euc_jp") as kanji:
            filename = "kradfile" + str(grade)
            with open(filename, 'w+') as newFile:
                for line in kanji:
                    charList = line.split()
                    #gets the first kanji (the one being described)
                    firstChar = charList[0]
                    i = 0
                    for dictLine in kData:
                        parts = dictLine.split()
                        if (parts[0] == firstChar):
                            if (int(parts[1]) <= grade):
                                newFile.write(line)
                            break                    

if __name__=='__main__':
    trimDict()
    for i in range(11):
        trim(i+1);
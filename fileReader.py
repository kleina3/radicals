from flask import Flask, render_template, jsonify
app = Flask(__name__)

@app.route("/getKanji/<grade>/")
def getKanji(grade):
    kanjiNodes = []
    radNodes = []
    links = []
    filename = "kradfile" + str(grade)
                
    #EUC-JP encapsulation
    with open(filename, "r") as file:
        for line in file:
            charList = line.split()
            #gets the first kanji (the one being described)
            firstChar = charList[0]
            kanjiNodes.append({'id': firstChar})
            
            #adds links for all radicals that make up the first kanji
            for word in charList[1:]:
                if word != ":":
                    #could we do this in the beginning somehow?
                    if word not in radNodes:
                        radNodes.append(word)
                    links.append({
                        'source': firstChar,
                        'target': word
                })
        radNodesAlt = []
        for rad in radNodes:
            radNodesAlt.append({'id': rad})
        return jsonify({
            'kanjiNodes': kanjiNodes,
            'radNodes': radNodesAlt,
            'links': links
        })

@app.route("/run/<gradeIn>/")
def run(gradeIn):
    gradeInt = int(gradeIn)
    if (gradeInt  < 1):
        return "Input grade is too low. It must be between 1 and 11."
    elif (gradeInt > 11):
        return "Input grade is too high. It must be between 1 and 11."
    else:
        return render_template('kanji.html', variable = gradeInt)

if __name__=='__main__':
    app.run(debug=True)
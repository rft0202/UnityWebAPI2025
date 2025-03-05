using JetBrains.Annotations;
using Newtonsoft.Json;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using TMPro;
using System.Text;

public class FetchData : MonoBehaviour
{
    string serverUrl = "http://localhost:3000/player";
    List<PlayerData> playerList;
    PlayerData player;
    public GameObject playerData;


    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        StartFetch();
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public IEnumerator GetData()
    {
        using (UnityWebRequest request = UnityWebRequest.Get(serverUrl))
        {
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                //Success
                string json = request.downloadHandler.text;
                Debug.Log($"Recieved the data: {json}");

                //Deserialize the data to use in unity
                //player = JsonUtility.FromJson<PlayerData>(json);
                playerList = JsonConvert.DeserializeObject<List<PlayerData>>(json);

                //Print out the player info
                //Debug.Log($"Name: {player.name}, Score: {player.score}, Level: {player.level}");
                Debug.Log(playerList);
            }
            else
            {
                //Failed
                Debug.Log($"Error fetching data: {request.error}");
            }
        }     
    }

    public IEnumerator GetDataByID(string json, string playerid = "")
    {
        string url = serverUrl + "/" + playerid;
        Debug.Log(url);
        byte[] jsonToSend = Encoding.UTF8.GetBytes(json);
        UnityWebRequest request = new UnityWebRequest(url, "GET");
        request.uploadHandler = new UploadHandlerRaw(jsonToSend);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
        {
            string response = request.downloadHandler.text;
            Debug.Log($"Success: {response}");

            //Extract playerid
            string newPlayerId = ExtractPlayerId(response);
            if (!string.IsNullOrEmpty(newPlayerId))
            {
                Debug.Log("PlayerID: " + newPlayerId);
                //player = JsonUtility.FromJson<PlayerData>(json);
                //player = JsonUtility.FromJson<PlayerData>(response);
                player = JsonConvert.DeserializeObject<PlayerData>(response);
                GetPlayer();
                playerData.SetActive(true);
            }
            yield return null;
        }
        else 
        {
            //Handles Error
            Debug.Log("Error: " + request.error);
            yield return null;
        }
    }

    public void StartFetch()
    {
        StartCoroutine(GetData());
    }

    public void SetupPlayerSearchData(string name, string playerid)
    {
        player = new PlayerData();

        player.screenName = name;
        

        string json = JsonUtility.ToJson(player);
        Debug.Log(json);
        StartCoroutine(GetDataByID(json, playerid));

    }

    public void GetPlayer()
    {
        playerData.transform.GetChild(0).GetComponent<TMP_Text>().text = player.screenName;
        playerData.transform.GetChild(1).GetComponent<TMP_Text>().text = player.firstName;
        playerData.transform.GetChild(2).GetComponent<TMP_Text>().text = player.lastName;
        playerData.transform.GetChild(3).GetComponent<TMP_Text>().text = player.dateStarted;
        playerData.transform.GetChild(4).GetComponent<TMP_Text>().text = player.score.ToString();
    }

    string ExtractPlayerId(string jsonResponse)
    {
        int index = jsonResponse.IndexOf("\"playerid\":\"") + 12;
        if (index < 12) return "";
        int endIndex = jsonResponse.IndexOf("\"", index);
        return jsonResponse.Substring(index, endIndex - index);

    }
}

public class PlayerData 
{
    public string screenName;
    public string firstName;
    public string lastName;
    public string dateStarted;
    public int score;

}

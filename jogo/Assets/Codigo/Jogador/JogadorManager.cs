using System.Collections;
using System.Collections.Generic;
using System.Text.Json;
using TMPro;
using UnityEngine;

public class JogadorManager : MonoBehaviour {

    [Header("Dados")]
    public int level;
    public int power;
    public int gold;
    public Corpo corpo;

    [Header("Dados Internos")]
    public Vector3 posi;
    private float speed = 2F;
    private float distancia = 0.5F;
    public Vector3 posiAndar;
    public LayerMask stopMovement;
    private Animator animator;

    [Header("Gameplay")]
    public bool Pronto;

    [Header("Server Identity")]
    [SerializeField]
    public ServerIdentity serverIdentity;

    void Start() {
        posi = transform.position;
        posiAndar = transform.position;
        animator = GetComponent<Animator>();
        Pronto = false;
    }

    void Update() {
        transform.position = Vector3.MoveTowards(transform.position, posiAndar, speed * Time.deltaTime);

        if(serverIdentity.IsControlavel()) {
            checkInput();
        }else {
            if(transform.position != posiAndar) {
                animator.SetFloat("X", posiAndar.x - transform.position.x);
                animator.SetFloat("Y",  posiAndar.y - transform.position.y);
                animator.SetBool("Moving", true);
            }else {
                animator.SetBool("Moving", false);
            }
        }
    }

    private void checkInput() {
        if(Vector3.Distance(transform.position, posiAndar) <= 0.05f){
            if(Mathf.Abs(Input.GetAxisRaw("Horizontal")) == 1f ) {
                animator.SetFloat("X", Input.GetAxisRaw("Horizontal"));
                animator.SetFloat("Y", Input.GetAxisRaw("Vertical"));
                Vector3 move = new Vector3(Input.GetAxisRaw("Horizontal")*distancia, 0, 0);
                makeMove(move);
            }else if(Mathf.Abs(Input.GetAxisRaw("Vertical")) == 1f ) {
                animator.SetFloat("X", Input.GetAxisRaw("Horizontal"));
                animator.SetFloat("Y", Input.GetAxisRaw("Vertical"));
                Vector3 move  = new Vector3(0, Input.GetAxisRaw("Vertical")*distancia, 0);
                makeMove(move);
            }else {
                animator.SetBool("Moving", false);
            }
        }
    }

    private void makeMove(Vector3 vec) {
        if(!Physics2D.OverlapCircle(posiAndar + vec, 0.2f, stopMovement)) {
            animator.SetBool("Moving", true);
            posiAndar += vec;

            Position andando = new Position();
            andando.x = posiAndar.x;
            andando.y = posiAndar.y;
            serverIdentity.GetSocket().Emit("move", JsonSerializer.Serialize(andando));
        }
    }

    public void atualizaNome() {
        GameObject childObject = transform.Find("Nome").gameObject;
        TMP_Text textMash = childObject.GetComponent<TMP_Text>();
        textMash.text = "LV:" + level + " Pw:" + power;
    }

    public void prontoAtv() {
        if(Pronto) {
            Pronto = false;
        }else {
            Pronto = true;
        }
        serverIdentity.GetSocket().Emit("pronto", Pronto);
    }

}
